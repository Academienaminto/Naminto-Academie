import { AppError } from "@/lib/errors";
import { recordEvent } from "@/lib/events/record";
import { recordAudit } from "@/lib/audit/record";
import { notify } from "@/modules/notifications/service";
import * as repo from "@/modules/deadlines/repository";
import {
  ALERT_INTERVAL_DAYS,
  DEADLINE_DURATION_DAYS,
  addDays,
} from "@/modules/deadlines/validation";

// RÈGLES MÉTIER §23 : le délai doit être contrôlé par le système, jamais
// uniquement affiché par l'interface. Démarré à l'activation du cours
// (première fois qu'il devient ACCESSIBLE pour l'apprenant) — voir l'appel
// depuis modules/progress/service.ts getCourseAccessState.

/** Idempotent : ne crée un délai que s'il n'en existe pas déjà un actif
 * pour ce couple (utilisateur, cours). Appelé à chaque calcul d'accès —
 * doit rester silencieux et rapide. */
export async function ensureDeadlineStarted(
  userId: string,
  courseId: string,
  enrollmentId: string | null,
) {
  const existing = await repo.findActiveDeadline(userId, courseId);
  if (existing) {
    return existing;
  }
  const startAt = new Date();
  const dueAt = addDays(startAt, DEADLINE_DURATION_DAYS);
  return repo.createDeadline(userId, courseId, enrollmentId, startAt, dueAt);
}

async function closeCourseForDelay(userId: string, courseId: string) {
  await repo.closeCourseProgress(userId, courseId);

  const course = await repo.findCourseForClosure(courseId);
  if (!course) return;

  // RÈGLES MÉTIER §26 : une nouvelle acquisition peut être nécessaire —
  // seuls les cours/formations payants ont un accès commercial à suspendre.
  const product = course.formationPart
    ? course.formationPart.formation.products[0]
    : course.products[0];
  if (product) {
    await repo.suspendAccess(userId, product.id);
  }
}

/**
 * Balayage des délais en retard — destiné à être déclenché périodiquement
 * (cron externe/tâche planifiée, voir app/api/v1/deadlines/process/route.ts)
 * puisque cette application ne porte pas de worker en tâche de fond.
 * RÈGLES MÉTIER §24 : ALERTE 1 (J+30) → ALERTE 2 (J+37) → ALERTE 3 =
 * fermeture (J+44), sauf réinitialisation entre-temps.
 */
export async function processDueDeadlines() {
  const now = new Date();
  const cutoff = addDays(now, -ALERT_INTERVAL_DAYS);
  const result = { warning1: 0, warning2: 0, closed: 0 };

  const stage1 = await repo.findDueForStage1(now);
  for (const deadline of stage1) {
    await repo.markWarning1(deadline.id, now);
    const event = await recordEvent({
      type: "COURSE_DEADLINE_EXCEEDED",
      userId: deadline.userId,
      entityType: "COURSE",
      entityId: deadline.courseId,
    });
    await notify({
      userId: deadline.userId,
      eventId: event.id,
      type: "COURSE_DEADLINE_EXCEEDED",
      title: "Délai dépassé",
      message: "Le délai prévu pour ce cours est dépassé. Poursuivez votre progression pour éviter la fermeture du cours.",
    });
    result.warning1++;
  }

  const stage2 = await repo.findDueForStage2(cutoff);
  for (const deadline of stage2) {
    await repo.markWarning2(deadline.id, now);
    const event = await recordEvent({
      type: "COURSE_DELAY_WARNING_2",
      userId: deadline.userId,
      entityType: "COURSE",
      entityId: deadline.courseId,
    });
    await notify({
      userId: deadline.userId,
      eventId: event.id,
      type: "COURSE_DELAY_WARNING_2",
      title: "Deuxième alerte de retard",
      message: "Le retard persiste. Contactez le Seuil si une réinitialisation du délai est nécessaire.",
    });
    result.warning2++;
  }

  const stage3 = await repo.findDueForStage3(cutoff);
  for (const deadline of stage3) {
    await repo.markWarning3AndClose(deadline.id, now);
    await closeCourseForDelay(deadline.userId, deadline.courseId);
    await recordAudit({
      actorType: "SYSTEM",
      actorId: "deadline-sweep",
      action: "COURSE_CLOSED_FOR_DELAY",
      entityType: "COURSE",
      entityId: deadline.courseId,
      oldValue: { status: "EN_COURS" },
      newValue: { status: "FERME" },
      metadata: { userId: deadline.userId, deadlineId: deadline.id },
    });

    const warnEvent = await recordEvent({
      type: "COURSE_DELAY_WARNING_3",
      userId: deadline.userId,
      entityType: "COURSE",
      entityId: deadline.courseId,
    });
    await notify({
      userId: deadline.userId,
      eventId: warnEvent.id,
      type: "COURSE_DELAY_WARNING_3",
      title: "Cours fermé pour dépassement de délai",
      message: "Ce cours a été fermé faute de progression dans les délais. Une nouvelle acquisition peut être nécessaire pour le reprendre.",
    });
    const closedEvent = await recordEvent({
      type: "COURSE_CLOSED_FOR_DELAY",
      userId: deadline.userId,
      entityType: "COURSE",
      entityId: deadline.courseId,
    });
    await notify({
      userId: deadline.userId,
      eventId: closedEvent.id,
      type: "COURSE_CLOSED_FOR_DELAY",
      title: "Accès fermé",
      message: "L'accès à ce cours a été fermé.",
    });
    result.closed++;
  }

  return result;
}

export function listAll() {
  return repo.listAllDeadlines();
}

/** RÈGLES MÉTIER §25 : réinitialisation du délai, sans jamais supprimer
 * l'historique des événements antérieurs (préservé, aucune suppression ici). */
export async function reset(deadlineId: string, seuilUserId: string) {
  const deadline = await repo.findDeadlineById(deadlineId);
  if (!deadline) {
    throw new AppError("RESOURCE_NOT_FOUND", "Délai introuvable.");
  }
  if (deadline.status !== "EN_COURS") {
    throw new AppError(
      "INVALID_STATE",
      "Un délai fermé ne peut pas être réinitialisé ; une nouvelle acquisition est nécessaire.",
    );
  }
  const startAt = new Date();
  const dueAt = addDays(startAt, DEADLINE_DURATION_DAYS);
  const updated = await repo.resetDeadline(deadlineId, startAt, dueAt);
  await recordAudit({
    actorType: "SEUIL",
    actorId: seuilUserId,
    action: "DEADLINE_RESET",
    entityType: "DEADLINE",
    entityId: deadlineId,
    oldValue: { dueAt: deadline.dueAt, warning1At: deadline.warning1At, warning2At: deadline.warning2At },
    newValue: { dueAt, startAt },
    metadata: { userId: deadline.userId, courseId: deadline.courseId },
  });
  return updated;
}
