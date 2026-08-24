import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { createQuizSchema } from "@/modules/quiz/validation";
import { createQuiz } from "@/modules/quiz/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const POST = handleRoute(async (req, { params }: Params) => {
  await requirePermission("MANAGE_QUIZZES");
  const { id } = await params;
  const body = createQuizSchema.parse(await req.json());
  const quiz = await createQuiz(id, body);
  return ok(quiz, 201);
});
