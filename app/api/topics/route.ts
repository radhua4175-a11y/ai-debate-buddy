import { suggestTopics } from "@/lib/ai/debate";
import { apiHandler, parseJson, requireUser } from "@/lib/api/handler";
import { consumeAiBudget } from "@/lib/db/ai-usage";
import { suggestTopicsSchema } from "@/lib/validation";

export const POST = apiHandler(async (request: Request) => {
  const { supabase } = await requireUser();
  const { locale, interest } = await parseJson(request, suggestTopicsSchema);
  await consumeAiBudget(supabase, "topics");
  return { topics: await suggestTopics(locale, interest) };
});
