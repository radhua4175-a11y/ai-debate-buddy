import { describe, expect, it } from "vitest";
import { mapAuthError } from "@/lib/auth/errors";
import { hasSessionCookie, isAuthPage, localeFromPath, safeNextPath, sessionCookieName } from "@/lib/auth/routes";
import { logInSchema, signUpSchema } from "@/lib/validation";

describe("safeNextPath", () => {
  it("keeps same-site paths inside a locale", () => {
    expect(safeNextPath("/en/setup?topic=pets&level=easy", "en")).toBe("/en/setup?topic=pets&level=easy");
    expect(safeNextPath("/hi/progress", "en")).toBe("/hi/progress");
  });

  it.each([
    null,
    "",
    "https://evil.example/en",
    "//evil.example/en",
    "/\\evil.example",
    "javascript:alert(1)",
    "/fr/setup",
    "/en/login",
    "/en/signup?next=/en",
  ])("falls back to the home page for %j", (next) => {
    expect(safeNextPath(next, "hi")).toBe("/hi");
  });
});

describe("route helpers", () => {
  const cookie = sessionCookieName("https://abc123.supabase.co");

  it("derives the cookie name the same way supabase-js does", () => {
    expect(cookie).toBe("sb-abc123-auth-token");
    expect(sessionCookieName("http://127.0.0.1:54321")).toBe("sb-127-auth-token");
  });

  it("detects only this project's session cookie, including chunked ones", () => {
    expect(hasSessionCookie(["sb-abc123-auth-token"], cookie)).toBe(true);
    expect(hasSessionCookie(["sb-abc123-auth-token.0", "sb-abc123-auth-token.1"], cookie)).toBe(true);
    expect(hasSessionCookie(["sb-abc123-auth-token-code-verifier"], cookie)).toBe(false);
    // Another Supabase app on localhost must not make us think the student is signed in.
    expect(hasSessionCookie(["sb-otherproject-auth-token"], cookie)).toBe(false);
    expect(hasSessionCookie(["sb-abc123-auth-token.x"], cookie)).toBe(false);
    expect(hasSessionCookie(["theme", "session"], cookie)).toBe(false);
  });

  it("knows the auth pages and the locale of a path", () => {
    expect(isAuthPage("login")).toBe(true);
    expect(isAuthPage("setup")).toBe(false);
    expect(isAuthPage(undefined)).toBe(false);
    expect(localeFromPath("/hi/progress")).toBe("hi");
    expect(localeFromPath("/whatever")).toBe("en");
  });
});

describe("mapAuthError", () => {
  it.each([
    [{ code: "invalid_credentials" }, "invalid_credentials"],
    [{ code: "user_already_exists" }, "user_exists"],
    [{ code: "email_exists" }, "user_exists"],
    [{ code: "weak_password" }, "weak_password"],
    [{ code: "over_email_send_rate_limit" }, "rate_limited"],
    [{ status: 429 }, "rate_limited"],
    [{ code: "email_not_confirmed" }, "confirm_required"],
    [{ name: "AuthRetryableFetchError" }, "network"],
    [{ code: "something_new" }, "generic"],
    [null, "generic"],
  ] as const)("maps %j to %s", (error, expected) => {
    expect(mapAuthError(error)).toBe(expected);
  });
});

describe("auth schemas", () => {
  it("validates sign-up input", () => {
    expect(signUpSchema.safeParse({ name: " Medhansh ", email: "kid@example.com", password: "longenough" }).data?.name).toBe(
      "Medhansh",
    );
    expect(signUpSchema.safeParse({ name: "A", email: "not-an-email", password: "longenough" }).success).toBe(false);
    expect(signUpSchema.safeParse({ name: "A", email: "kid@example.com", password: "short" }).success).toBe(false);
    expect(signUpSchema.safeParse({ name: "", email: "kid@example.com", password: "longenough" }).success).toBe(false);
    expect(signUpSchema.safeParse({ name: "A", email: "kid@example.com", password: "x".repeat(73) }).success).toBe(false);
  });

  it("validates log-in input", () => {
    expect(logInSchema.safeParse({ email: "kid@example.com", password: "x" }).success).toBe(true);
    expect(logInSchema.safeParse({ email: "kid@example.com", password: "" }).success).toBe(false);
  });
});
