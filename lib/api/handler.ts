import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ZodType } from "zod";
import { LIMITS } from "@/lib/limits";
import type { ApiErrorCode } from "@/lib/types";
import { SupabaseNotConfiguredError } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode,
  ) {
    super(code);
  }
}

export interface Authed {
  supabase: SupabaseClient;
  userId: string;
}

/** Resolves the signed-in user. `getUser` re-validates the JWT with Supabase Auth. */
export async function requireUser(): Promise<Authed> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new ApiError(401, "unauthorized");
  return { supabase, userId: data.user.id };
}

/** Cookie auth + JSON bodies: reject cross-site writes and non-JSON content types. */
export function assertSafeWrite(request: Request): void {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin) {
    let originHost: string | null = null;
    try {
      originHost = new URL(origin).host;
    } catch {
      // fall through to rejection
    }
    if (!host || originHost !== host) throw new ApiError(403, "forbidden_origin");
  }
}

export async function parseJson<T>(request: Request, schema: ZodType<T>): Promise<T> {
  assertSafeWrite(request);
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new ApiError(400, "invalid_request");
  }
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > LIMITS.requestBodyMaxBytes) throw new ApiError(413, "invalid_request");
  const text = await request.text();
  if (text.length > LIMITS.requestBodyMaxBytes) throw new ApiError(413, "invalid_request");
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new ApiError(400, "invalid_request");
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) throw new ApiError(400, "invalid_request");
  return parsed.data;
}

export function parseId(value: string, schema: ZodType<string>): string {
  const parsed = schema.safeParse(value);
  if (!parsed.success) throw new ApiError(404, "not_found");
  return parsed.data;
}

/** Wraps a route handler: maps ApiError to JSON and hides unexpected failures. */
export function apiHandler<Ctx>(fn: (request: Request, ctx: Ctx) => Promise<unknown>) {
  return async (request: Request, ctx: Ctx): Promise<Response> => {
    try {
      const body = await fn(request, ctx);
      return Response.json(body, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      if (error instanceof ApiError) {
        return Response.json({ error: error.code }, { status: error.status });
      }
      if (error instanceof SupabaseNotConfiguredError) {
        console.error(`[Debate Buddy setup] ${error.message}`);
        return Response.json({ error: "not_configured" }, { status: 503 });
      }
      console.error("Unhandled API error", error);
      return Response.json({ error: "server_error" }, { status: 500 });
    }
  };
}
