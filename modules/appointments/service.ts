import { AppError } from "@/lib/errors";
import { notify } from "@/modules/notifications/service";
import * as repo from "@/modules/appointments/repository";
import * as sessions from "@/modules/sessions/service";

// ARCHITECTURE GÉNÉRALE / PROMPT MASTER RENDEZ-VOUS : MEMBRE/APPRENANT →
// DEMANDE → ENREGISTREMENT → CONFIRMATION → CALENDRIER → NOTIFICATION →
// RENDEZ-VOUS → MODIFICATION/REPORT/ANNULATION.
// Pas de disponibilités automatiques (non définies officiellement) : le
// Seuil confirme ou reporte manuellement chaque demande.
//
// RÈGLES MÉTIER §22 : la séance et le rendez-vous restent deux notions
// distinctes — un rendez-vous PEUT référencer une séance pédagogique, sans
// que ce soit obligatoire (contact général, par exemple).

export async function propose(
  userId: string,
  proposedAt: Date,
  learningSessionId?: string,
) {
  if (learningSessionId) {
    await sessions.reserve(userId, learningSessionId);
  }
  return repo.createAppointment(userId, proposedAt, learningSessionId);
}

export function listMine(userId: string) {
  return repo.listMine(userId);
}

export function listAll() {
  return repo.listAll();
}

async function loadForUser(
  id: string,
  userId: string,
  canManageAll: boolean,
) {
  const appointment = await repo.findById(id);
  if (!appointment) {
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      "Rendez-vous introuvable.",
      undefined,
      "appointments.notFound",
    );
  }
  if (!canManageAll && appointment.userId !== userId) {
    throw new AppError(
      "FORBIDDEN",
      "Ce rendez-vous ne vous appartient pas.",
      undefined,
      "appointments.forbidden",
    );
  }
  return appointment;
}

export async function confirm(
  id: string,
  scheduledAt: Date,
  requesterId: string,
) {
  const appointment = await loadForUser(id, requesterId, true); // Seuil only, garanti par la route
  if (appointment.status !== "PROPOSE") {
    throw new AppError("INVALID_STATE", "Ce rendez-vous n'est plus en attente.");
  }
  const updated = await repo.confirm(id, scheduledAt);
  if (appointment.learningSessionId) {
    await sessions.markScheduled(appointment.learningSessionId, scheduledAt);
  }
  await notify({
    userId: appointment.userId,
    type: "APPOINTMENT_CONFIRMED",
    title: "Rendez-vous confirmé",
    message: `Votre rendez-vous est confirmé pour le ${scheduledAt.toLocaleString("fr-FR")}.`,
  });
  return updated;
}

export async function reschedule(
  id: string,
  scheduledAt: Date,
  requesterId: string,
) {
  const appointment = await loadForUser(id, requesterId, true);
  if (appointment.status === "ANNULE" || appointment.status === "TERMINE") {
    throw new AppError("INVALID_STATE", "Ce rendez-vous ne peut plus être modifié.");
  }
  const updated = await repo.reschedule(id, scheduledAt);
  if (appointment.learningSessionId) {
    await sessions.markScheduled(appointment.learningSessionId, scheduledAt);
  }
  await notify({
    userId: appointment.userId,
    type: "APPOINTMENT_UPDATED",
    title: "Rendez-vous reporté",
    message: `Votre rendez-vous a été reporté au ${scheduledAt.toLocaleString("fr-FR")}.`,
  });
  return updated;
}

export async function cancel(
  id: string,
  requesterId: string,
  canManageAll: boolean,
) {
  const appointment = await loadForUser(id, requesterId, canManageAll);
  if (appointment.status === "ANNULE" || appointment.status === "TERMINE") {
    throw new AppError(
      "INVALID_STATE",
      "Ce rendez-vous ne peut plus être annulé.",
      undefined,
      "appointments.cannotCancel",
    );
  }
  const updated = await repo.cancel(id);
  if (appointment.learningSessionId) {
    // RÈGLES MÉTIER §22 : l'annulation ne doit pas consommer une des trois
    // séances de l'apprenant — elle redevient disponible.
    await sessions.release(appointment.learningSessionId);
  }
  // Notifie l'autre partie : si c'est le Seuil qui annule, le membre est
  // prévenu ; si c'est le membre, pas de destinataire individuel unique
  // ici (voir Espace du Seuil pour la vue d'ensemble).
  if (canManageAll) {
    await notify({
      userId: appointment.userId,
      type: "APPOINTMENT_CANCELLED",
      title: "Rendez-vous annulé",
      message: "Votre rendez-vous a été annulé par le Seuil.",
    });
  }
  return updated;
}

export async function complete(id: string) {
  const appointment = await repo.findById(id);
  if (!appointment) {
    throw new AppError("RESOURCE_NOT_FOUND", "Rendez-vous introuvable.");
  }
  if (appointment.status !== "CONFIRME") {
    throw new AppError("INVALID_STATE", "Seul un rendez-vous confirmé peut être clôturé.");
  }
  const updated = await repo.complete(id);
  if (appointment.learningSessionId) {
    await sessions.complete(appointment.learningSessionId);
  }
  return updated;
}
