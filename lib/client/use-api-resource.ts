"use client";

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { api } from "./api";
import { useErrorMessage } from "./use-error-message";

interface Resource<T> {
  data: T | null;
  setData: Dispatch<SetStateAction<T | null>>;
  error: string | null;
  reload: () => void;
}

/** Loads a GET endpoint (skipped while `path` is null); `reload` retries after an error. */
export function useApiResource<T>(path: string | null, refreshKey?: string): Resource<T> {
  const errorMessage = useErrorMessage();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (path === null) return;
    let cancelled = false;
    api<T>(path)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(errorMessage(e));
      });
    return () => {
      cancelled = true;
    };
  }, [path, attempt, refreshKey, errorMessage]);

  const reload = useCallback(() => {
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  return { data, setData, error, reload };
}
