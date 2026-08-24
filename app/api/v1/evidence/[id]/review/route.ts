import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { reviewEvidenceSchema } from "@/modules/quiz/validation";
import { reviewEvidence } from "@/modules/quiz/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const POST = handleRoute(async (req, { params }: Params) => {
  const user = await requirePermission("REVIEW_EVIDENCE");
  const { id } = await params;
  const body = reviewEvidenceSchema.parse(await req.json());
  const result = await reviewEvidence(user.id, id, body.decision, body.comment);
  return ok(result);
});
