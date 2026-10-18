import "server-only";

// Plain "provider/model" strings are routed through the Vercel AI Gateway.
export const MODEL_ID = process.env.AI_MODEL ?? "anthropic/claude-haiku-4.5";
