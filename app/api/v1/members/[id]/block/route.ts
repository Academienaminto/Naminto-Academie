import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { block } from "@/modules/members/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const PATCH = handleRoute(async (_req, { params }: Params) => {
  const seuilUser = await requirePermission("BLOCK_ACCOUNT");
  const { id } = await params;
  await block(id, seuilUser.id);
  return ok({ status: "BLOQUE" });
});
