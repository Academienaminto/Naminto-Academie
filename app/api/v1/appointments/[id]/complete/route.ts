import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { complete } from "@/modules/appointments/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const PATCH = handleRoute(async (_req, { params }: Params) => {
  await requirePermission("MANAGE_APPOINTMENTS");
  const { id } = await params;
  const appointment = await complete(id);
  return ok(appointment);
});
