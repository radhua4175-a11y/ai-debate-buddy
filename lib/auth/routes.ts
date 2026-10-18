import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";

export const AUTH_PAGES = ["login", "signup"] as const;
export type AuthPage = (typeof AUTH_PAGES)[number];

export function isAuthPage(segment: string | undefined): segment is AuthPage {
  return (AUTH_PAGES as readonly string[]).includes(segment ?? "");
}

/** Cookie supabase-js stores this project's session under (`sb-<project ref>-auth-token`). */
export function sessionCookieName(supabaseUrl: string): string {
  return `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`;
}

/**
 * True when this project's session cookie is present (possibly chunked as `.0`, `.1`, …).
 * Other Supabase apps on the same host (e.g. localhost) set their own `sb-*` cookies, which must not count.
 * Only a routing hint: the API verifies the session and RLS enforces access.
 */
export function hasSessionCookie(names: string[], cookieName: string): boolean {
  return names.some((name) => name === cookieName || (name.startsWith(`${cookieName}.`) && /^\d+$/.test(name.slice(cookieName.length + 1))));
}

/** Where to go after login: only same-site paths inside the locale, never `//host` or absolute URLs. */
export function safeNextPath(next: string | null | undefined, locale: Locale): string {
  const fallback = `/${locale}`;
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  const segments = next.split("?")[0].split("/");
  if (!isLocale(segments[1]) || isAuthPage(segments[2])) return fallback;
  return next;
}

export function localeFromPath(pathname: string): Locale {
  const first = pathname.split("/")[1];
  return isLocale(first) ? first : defaultLocale;
}
