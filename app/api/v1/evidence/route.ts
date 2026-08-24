import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { listPendingEvidence } from "@/modules/quiz/service";

export const GET = handleRoute(async () => {
  await requirePermission("REVIEW_EVIDENCE");
  const evidence = await listPendingEvidence();
  return ok(evidence);
});
