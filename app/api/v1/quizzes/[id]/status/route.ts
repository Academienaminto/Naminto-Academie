import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { publishSchema } from "@/modules/cursus/validation";
import { setQuizStatus } from "@/modules/quiz/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const PATCH = handleRoute(async (req, { params }: Params) => {
  await requirePermission("MANAGE_QUIZZES");
  const { id } = await params;
  const body = publishSchema.parse(await req.json());
  const quiz = await setQuizStatus(id, body.status);
  return ok(quiz);
});
