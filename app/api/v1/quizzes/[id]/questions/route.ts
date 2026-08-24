import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { createQuestionSchema } from "@/modules/quiz/validation";
import { addQuestion } from "@/modules/quiz/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const POST = handleRoute(async (req, { params }: Params) => {
  await requirePermission("MANAGE_QUIZZES");
  const { id } = await params;
  const body = createQuestionSchema.parse(await req.json());
  const question = await addQuestion(id, body);
  return ok(question, 201);
});
