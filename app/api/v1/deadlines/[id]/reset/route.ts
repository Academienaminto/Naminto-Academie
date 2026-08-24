import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { reset } from "@/modules/deadlines/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const POST = handleRoute(async (_req, { params }: Params) => {
  const seuilUser = await requirePermission("MANAGE_DEADLINES");
  const { id } = await params;
  const deadline = await reset(id, seuilUser.id);
  return ok(deadline);
});
