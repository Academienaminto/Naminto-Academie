import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { markForDeletion } from "@/modules/members/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const PATCH = handleRoute(async (_req, { params }: Params) => {
  const seuilUser = await requirePermission("DELETE_ACCOUNT_ADMIN");
  const { id } = await params;
  await markForDeletion(id, seuilUser.id);
  return ok({ status: "EN_SUPPRESSION" });
});
