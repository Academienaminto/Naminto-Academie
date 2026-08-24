import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { restore } from "@/modules/members/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const PATCH = handleRoute(async (_req, { params }: Params) => {
  const seuilUser = await requirePermission("RESTORE_ACCOUNT_ADMIN");
  const { id } = await params;
  await restore(id, seuilUser.id);
  return ok({ status: "ACTIF" });
});
