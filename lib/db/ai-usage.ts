import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "@/lib/api/handler";
import { LIMITS } from "@/lib/limits";

async function countSince(supabase: SupabaseClient, since: Date): Promise<number> {
  const { count, error } = await supabase
    .from("ai_requests")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since.toISOString());
  if (error) throw error;
  return count ?? 0;
}

/** Records an AI call for the current user and rejects it if they are over budget. */
export async function consumeAiBudget(supabase: SupabaseClient, kind: string): Promise<void> {
  const now = Date.now();
  const [perMinute, perDay] = await Promise.all([
    countSince(supabase, new Date(now - 60_000)),
    countSince(supabase, new Date(now - 24 * 60 * 60_000)),
  ]);
  if (perMinute >= LIMITS.aiCallsPerMinute || perDay >= LIMITS.aiCallsPerDay) {
    throw new ApiError(429, "rate_limited");
  }
  const { error } = await supabase.from("ai_requests").insert({ kind });
  if (error) throw error;
}
