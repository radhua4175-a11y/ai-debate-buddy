"use client";

import { useCallback } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { ClientApiError } from "./api";

/** Maps any thrown value to a translated, student-friendly message. */
export function useErrorMessage() {
  const { dict } = useI18n();
  return useCallback(
    (error: unknown): string =>
      error instanceof ClientApiError ? dict.errors[error.code] : dict.errors.server_error,
    [dict],
  );
}
