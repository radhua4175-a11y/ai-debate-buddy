import { generateHint } from "@/lib/ai/debate";
import { ApiError, apiHandler, assertSafeWrite, parseId, requireUser } from "@/lib/api/handler";
import { consumeAiBudget } from "@/lib/db/ai-usage";
import { getDebate } from "@/lib/db/debates";
import { isLocale } from "@/lib/i18n/config";
import { idSchema } from "@/lib/validation";

export const POST = apiHandler(async (request: Request, ctx: RouteContext<"/api/debates/[id]/hint">) => {
  assertSafeWrite(request);
  const id = parseId((await ctx.params).id, idSchema);
  const { supabase } = await requireUser();

  const debate = await getDebate(supabase, id);
  if (debate.status === "ended") throw new ApiError(409, "debate_ended");

  await consumeAiBudget(supabase, "hint");
  const hint = await generateHint({
    topic: debate.topic,
    side: debate.student_side,
    locale: isLocale(debate.locale) ? debate.locale : "en",
    history: debate.messages,
  });
  return { hint };
});
