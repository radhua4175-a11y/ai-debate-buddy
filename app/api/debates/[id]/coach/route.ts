import { generateCoachAnswer } from "@/lib/ai/debate";
import { ApiError, apiHandler, parseId, parseJson, requireUser } from "@/lib/api/handler";
import { consumeAiBudget } from "@/lib/db/ai-usage";
import { addMessage, getDebate } from "@/lib/db/debates";
import { isLocale } from "@/lib/i18n/config";
import type { DebateMessage } from "@/lib/types";
import { LIMITS } from "@/lib/limits";
import { coachQuestionSchema, idSchema } from "@/lib/validation";

export const POST = apiHandler(async (request: Request, ctx: RouteContext<"/api/debates/[id]/coach">) => {
  const id = parseId((await ctx.params).id, idSchema);
  const { supabase } = await requireUser();
  const { question } = await parseJson(request, coachQuestionSchema);

  const debate = await getDebate(supabase, id);
  if (!debate.review) throw new ApiError(409, "debate_active");
  const asked = debate.messages.filter((m) => m.channel === "coach" && m.role === "user").length;
  if (asked >= LIMITS.maxCoachQuestions) throw new ApiError(409, "coach_limit");

  await consumeAiBudget(supabase, "coach");

  const draft: DebateMessage = {
    id: "draft",
    channel: "coach",
    role: "user",
    content: question,
    created_at: new Date().toISOString(),
  };
  const answer = await generateCoachAnswer({
    topic: debate.topic,
    side: debate.student_side,
    locale: isLocale(debate.locale) ? debate.locale : "en",
    review: debate.review,
    history: [...debate.messages, draft],
  });
  const questionMessage = await addMessage(supabase, {
    debateId: id,
    channel: "coach",
    role: "user",
    content: question,
  });
  const answerMessage = await addMessage(supabase, {
    debateId: id,
    channel: "coach",
    role: "assistant",
    content: answer,
  });
  return { messages: [questionMessage, answerMessage] };
});
