import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { unblock } from "@/modules/members/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const PATCH = handleRoute(async (_req, { params }: Params) => {
  const seuilUser = await requirePermission("UNBLOCK_ACCOUNT");
  const { id } = await params;
  await unblock(id, seuilUser.id);
  return ok({ status: "ACTIF" });
});
