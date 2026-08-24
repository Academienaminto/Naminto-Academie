import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { scheduleSchema } from "@/modules/appointments/validation";
import { reschedule } from "@/modules/appointments/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const PATCH = handleRoute(async (req, { params }: Params) => {
  const user = await requirePermission("MANAGE_APPOINTMENTS");
  const { id } = await params;
  const body = scheduleSchema.parse(await req.json());
  const appointment = await reschedule(id, new Date(body.scheduledAt), user.id);
  return ok(appointment);
});
