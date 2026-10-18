import { apiHandler, parseJson, requireUser, ApiError } from "@/lib/api/handler";
import { isTopicAppropriate } from "@/lib/ai/debate";
import { consumeAiBudget } from "@/lib/db/ai-usage";
import { createDebate, listDebates } from "@/lib/db/debates";
import { isCuratedTopic } from "@/lib/topics";
import { createDebateSchema } from "@/lib/validation";

export const GET = apiHandler(async () => {
  const { supabase } = await requireUser();
  return { debates: await listDebates(supabase) };
});

export const POST = apiHandler(async (request: Request) => {
  const { supabase } = await requireUser();
  const input = await parseJson(request, createDebateSchema);

  // Custom topics are screened by the model; curated topics are already vetted.
  if (!isCuratedTopic(input.topic)) {
    await consumeAiBudget(supabase, "topic_check");
    if (!(await isTopicAppropriate(input.topic))) throw new ApiError(422, "topic_rejected");
  }

  return { debate: await createDebate(supabase, input) };
});
