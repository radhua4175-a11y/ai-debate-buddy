export const AUTH_ERROR_CODES = [
  "invalid_credentials",
  "user_exists",
  "weak_password",
  "rate_limited",
  "confirm_required",
  "not_configured",
  "network",
  "generic",
] as const;
export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];

/** Maps Supabase Auth error codes to our translated messages. */
export function mapAuthError(error: { code?: string; status?: number; name?: string } | null): AuthErrorCode {
  if (!error) return "generic";
  switch (error.code) {
    case "invalid_credentials":
      return "invalid_credentials";
    case "user_already_exists":
    case "email_exists":
      return "user_exists";
    case "weak_password":
      return "weak_password";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "rate_limited";
    case "email_not_confirmed":
      return "confirm_required";
  }
  if (error.status === 429) return "rate_limited";
  if (error.name === "AuthRetryableFetchError") return "network";
  return "generic";
}
