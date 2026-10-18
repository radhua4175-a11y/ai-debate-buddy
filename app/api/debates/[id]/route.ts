import { apiHandler, parseId, requireUser } from "@/lib/api/handler";
import { assertSafeWrite } from "@/lib/api/handler";
import { deleteDebate, getDebate } from "@/lib/db/debates";
import { idSchema } from "@/lib/validation";

type Ctx = RouteContext<"/api/debates/[id]">;

export const GET = apiHandler(async (_request: Request, ctx: Ctx) => {
  const id = parseId((await ctx.params).id, idSchema);
  const { supabase } = await requireUser();
  return { debate: await getDebate(supabase, id) };
});

export const DELETE = apiHandler(async (request: Request, ctx: Ctx) => {
  assertSafeWrite(request);
  const id = parseId((await ctx.params).id, idSchema);
  const { supabase } = await requireUser();
  await getDebate(supabase, id); // 404 when it isn't the caller's debate
  await deleteDebate(supabase, id);
  return { ok: true };
});
