import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

let client: SupabaseClient | undefined;

/** Browser client; the session lives in cookies so API routes and the proxy can read it. */
export function getBrowserSupabase(): SupabaseClient {
  if (!client) {
    const { url, key } = getSupabaseEnv();
    client = createBrowserClient(url, key);
  }
  return client;
}
