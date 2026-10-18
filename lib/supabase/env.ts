export class SupabaseNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseNotConfiguredError";
  }
}

// NEXT_PUBLIC_* values must be referenced literally so Next.js can inline them in the browser bundle.
export function getSupabaseEnv(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new SupabaseNotConfiguredError(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env.local, fill them in and restart `npm run dev`.",
    );
  }
  return { url, key };
}
