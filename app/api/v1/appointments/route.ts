import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission, requireUser } from "@/lib/auth/guards";
import { userHasPermission } from "@/lib/auth/permissions";
import { proposeAppointmentSchema } from "@/modules/appointments/validation";
import { listAll, listMine, propose } from "@/modules/appointments/service";

export const GET = handleRoute(async () => {
  // Authentifié requis ; canManageAll (MANAGE_APPOINTMENTS) bascule sur
  // listAll pour le Seuil, sinon listMine restreint à ses propres rendez-vous.
  const user = await requireUser();
  const canManageAll = await userHasPermission(user.id, "MANAGE_APPOINTMENTS");
  const appointments = canManageAll ? await listAll() : await listMine(user.id);
  return ok(appointments);
});

export const POST = handleRoute(async (req) => {
  const user = await requirePermission("REQUEST_APPOINTMENT");
  const body = proposeAppointmentSchema.parse(await req.json());
  const appointment = await propose(
    user.id,
    new Date(body.proposedAt),
    body.learningSessionId,
  );
  return ok(appointment, 201);
});
