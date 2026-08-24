import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { startAttempt } from "@/modules/quiz/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const POST = handleRoute(async (_req, { params }: Params) => {
  const user = await requirePermission("TAKE_QUIZ");
  const { id } = await params;
  const { attempt, quiz } = await startAttempt(user.id, id);
  return ok(
    {
      attemptId: attempt.id,
      attemptNumber: attempt.attemptNumber,
      quiz: { id: quiz.id, title: quiz.title, questions: quiz.questions },
    },
    201,
  );
});
