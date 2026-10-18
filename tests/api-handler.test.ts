import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: vi.fn() }));

import { ApiError, apiHandler, assertSafeWrite, parseId, parseJson } from "@/lib/api/handler";
import { consumeAiBudget } from "@/lib/db/ai-usage";
import { LIMITS } from "@/lib/limits";
import { sendMessageSchema, idSchema } from "@/lib/validation";

const post = (body: BodyInit, headers: Record<string, string> = {}) =>
  new Request("http://localhost:3000/api/x", {
    method: "POST",
    body,
    headers: { "content-type": "application/json", host: "localhost:3000", ...headers },
  });

describe("assertSafeWrite", () => {
  it("allows same-origin and origin-less requests", () => {
    expect(() => assertSafeWrite(post("{}", { origin: "http://localhost:3000" }))).not.toThrow();
    expect(() => assertSafeWrite(post("{}"))).not.toThrow();
  });

  it("rejects cross-site and malformed origins", () => {
    expect(() => assertSafeWrite(post("{}", { origin: "https://evil.example" }))).toThrow(ApiError);
    expect(() => assertSafeWrite(post("{}", { origin: "not a url" }))).toThrow(ApiError);
  });
});

describe("parseJson", () => {
  it("returns validated data", async () => {
    await expect(parseJson(post('{"content":" hi "}'), sendMessageSchema)).resolves.toEqual({ content: "hi" });
  });

  it("rejects wrong content type, bad JSON, schema violations and oversize bodies", async () => {
    await expect(parseJson(post("{}", { "content-type": "text/plain" }), sendMessageSchema)).rejects.toMatchObject({
      code: "invalid_request",
    });
    await expect(parseJson(post("{nope"), sendMessageSchema)).rejects.toMatchObject({ status: 400 });
    await expect(parseJson(post('{"content":""}'), sendMessageSchema)).rejects.toMatchObject({ status: 400 });
    const big = JSON.stringify({ content: "x".repeat(LIMITS.requestBodyMaxBytes) });
    await expect(parseJson(post(big), sendMessageSchema)).rejects.toMatchObject({ status: 413 });
  });
});

describe("parseId", () => {
  it("maps invalid ids to 404", () => {
    expect(() => parseId("abc", idSchema)).toThrowError(expect.objectContaining({ status: 404 }));
  });
});

describe("apiHandler", () => {
  it("serialises results with no-store caching", async () => {
    const res = await apiHandler(async () => ({ ok: true }))(new Request("http://x"), undefined);
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.json()).toEqual({ ok: true });
  });

  it("maps ApiError to its status and code", async () => {
    const res = await apiHandler(async () => {
      throw new ApiError(429, "rate_limited");
    })(new Request("http://x"), undefined);
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: "rate_limited" });
  });

  it("hides unexpected error details", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await apiHandler(async () => {
      throw new Error("secret db password");
    })(new Request("http://x"), undefined);
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain("secret");
    spy.mockRestore();
  });
});

describe("consumeAiBudget", () => {
  function fakeSupabase(counts: number[]) {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const queue = [...counts];
    const supabase = {
      from: () => ({
        select: () => ({ gte: () => Promise.resolve({ count: queue.shift(), error: null }) }),
        insert,
      }),
    };
    return { supabase: supabase as never, insert };
  }

  it("records the call when under budget", async () => {
    const { supabase, insert } = fakeSupabase([1, 5]);
    await consumeAiBudget(supabase, "review");
    expect(insert).toHaveBeenCalledWith({ kind: "review" });
  });

  it("rejects when the per-minute budget is spent", async () => {
    const { supabase, insert } = fakeSupabase([LIMITS.aiCallsPerMinute, 20]);
    await expect(consumeAiBudget(supabase, "review")).rejects.toMatchObject({ status: 429 });
    expect(insert).not.toHaveBeenCalled();
  });

  it("rejects when the daily budget is spent", async () => {
    const { supabase } = fakeSupabase([0, LIMITS.aiCallsPerDay]);
    await expect(consumeAiBudget(supabase, "review")).rejects.toMatchObject({ status: 429 });
  });
});

describe("missing Supabase config", () => {
  it("maps to a not_configured 503 instead of a generic error", async () => {
    const { SupabaseNotConfiguredError } = await import("@/lib/supabase/env");
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await apiHandler(async () => {
      throw new SupabaseNotConfiguredError("missing env");
    })(new Request("http://x"), undefined);
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "not_configured" });
    spy.mockRestore();
  });
});
