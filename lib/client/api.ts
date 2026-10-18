import { localeFromPath } from "@/lib/auth/routes";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { API_ERROR_CODES, type ApiErrorCode } from "@/lib/types";

export class ClientApiError extends Error {
  constructor(readonly code: ApiErrorCode | "network") {
    super(code);
  }
}

function isApiErrorCode(value: unknown): value is ApiErrorCode {
  return typeof value === "string" && (API_ERROR_CODES as readonly string[]).includes(value);
}

let redirecting = false;

/** Session expired or revoked: clear the stale cookie (so the proxy agrees) and go to the login page. */
async function redirectToLogin(): Promise<void> {
  // Several requests can fail at once (header + page); only the first one navigates.
  if (redirecting) return;
  redirecting = true;
  try {
    await getBrowserSupabase().auth.signOut({ scope: "local" });
  } catch {
    // not configured or offline: still send the student to the login page
  }
  const { pathname, search } = window.location;
  const next = encodeURIComponent(`${pathname}${search}`);
  // A full reload (not router.push) drops all client state from the expired session; this runs outside React.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(`/${localeFromPath(pathname)}/login?next=${next}`);
}

/** Calls our JSON API; the session cookie set at login authenticates the request. */
export async function api<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: init?.method ?? (init?.body === undefined ? "GET" : "POST"),
      headers: init?.body === undefined ? undefined : { "Content-Type": "application/json" },
      body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch {
    throw new ClientApiError("network");
  }
  const json: unknown = await response.json().catch(() => null);
  if (response.status === 401) {
    await redirectToLogin();
    throw new ClientApiError("unauthorized");
  }
  if (!response.ok) {
    const code = (json as { error?: unknown } | null)?.error;
    throw new ClientApiError(isApiErrorCode(code) ? code : "server_error");
  }
  return json as T;
}
