import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { submitAttemptSchema } from "@/modules/quiz/validation";
import { submitAttempt } from "@/modules/quiz/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const POST = handleRoute(async (req, { params }: Params) => {
  const user = await requirePermission("TAKE_QUIZ");
  const { id } = await params;
  const body = submitAttemptSchema.parse(await req.json());
  const result = await submitAttempt(user.id, id, body);
  return ok({
    scorePercent: result.scorePercent,
    passed: result.passed,
    pendingEvidence: result.pendingEvidence,
  });
});
