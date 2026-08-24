import { handleRoute, ok } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guards";
import { userHasPermission } from "@/lib/auth/permissions";
import { cancel } from "@/modules/appointments/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const PATCH = handleRoute(async (_req, { params }: Params) => {
  // Seule action du domaine rendez-vous ouverte au titulaire lui-même (les
  // autres — confirm/reschedule/complete — exigent MANAGE_APPOINTMENTS,
  // donc Seuil uniquement). La vérification de propriété (sauf
  // canManageAll) est déléguée à modules/appointments/service.ts (loadForUser).
  const user = await requireUser();
  const { id } = await params;
  const canManageAll = await userHasPermission(user.id, "MANAGE_APPOINTMENTS");
  const appointment = await cancel(id, user.id, canManageAll);
  return ok(appointment);
});
