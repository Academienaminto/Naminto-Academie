import { AppError } from "@/lib/errors";
import * as repo from "@/modules/sessions/repository";

// RÈGLES MÉTIER §21-22 : chaque cours du cursus dispose de trois séances
// réservées à l'apprenant ; chaque partie de formation également, mais au
// niveau de la partie (pas de chaque cours qui la compose). Une séance est
// une unité de suivi pédagogique, distincte d'un rendez-vous (§22) — le
// rendez-vous est l'événement planifié qui peut consommer une séance.

/** Idempotent : n'initialise les 3 séances qu'une seule fois par
 * (utilisateur, cours). Appelé depuis modules/progress/service.ts au même
 * point que ensureDeadlineStarted, dès que le cours devient ACCESSIBLE. */
export async function ensureSessionsForCourse(userId: string, courseId: string) {
  const existing = await repo.findSessionsForCourse(userId, courseId);
  if (existing.length > 0) {
    return existing;
  }
  await repo.createSessionsForCourse(userId, courseId);
  return repo.findSessionsForCourse(userId, courseId);
}

/** Équivalent pour une partie de formation. */
export async function ensureSessionsForPart(userId: string, formationPartId: string) {
  const existing = await repo.findSessionsForPart(userId, formationPartId);
  if (existing.length > 0) {
    return existing;
  }
  await repo.createSessionsForPart(userId, formationPartId);
  return repo.findSessionsForPart(userId, formationPartId);
}

/** Résout le bon regroupement (cours pour le cursus, partie pour une
 * formation — RÈGLES MÉTIER §21) à partir d'un simple courseId, pour que
 * l'appelant n'ait jamais à distinguer les deux cas lui-même. */
export async function listMineForCourse(userId: string, courseId: string) {
  const course = await repo.findCourseForSessions(courseId);
  if (!course) {
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      "Cours introuvable.",
      undefined,
      "common.courseNotFound",
    );
  }
  if (course.formationPartId) {
    return ensureSessionsForPart(userId, course.formationPartId);
  }
  return ensureSessionsForCourse(userId, courseId);
}

/**
 * Réserve une séance disponible pour un rendez-vous proposé (appelé depuis
 * modules/appointments/service.ts propose()). Ne réserve jamais une séance
 * qui ne vous appartient pas ou qui est déjà consommée/réservée.
 */
export async function reserve(userId: string, sessionId: string) {
  const session = await repo.findSessionById(sessionId);
  if (!session || session.userId !== userId) {
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      "Séance introuvable.",
      undefined,
      "sessions.notFound",
    );
  }
  if (session.status !== "DISPONIBLE") {
    throw new AppError(
      "INVALID_STATE",
      "Cette séance n'est plus disponible.",
      undefined,
      "sessions.notAvailable",
    );
  }
  return repo.markReserved(sessionId);
}

/** Rendez-vous annulé : la séance redevient disponible plutôt que d'être
 * consommée pour rien — seule une séance RÉALISÉE compte comme utilisée. */
export async function release(sessionId: string) {
  const session = await repo.findSessionById(sessionId);
  if (!session || session.status !== "RESERVEE") {
    return null;
  }
  return repo.markAvailable(sessionId);
}

export async function markScheduled(sessionId: string, scheduledAt: Date) {
  const session = await repo.findSessionById(sessionId);
  if (!session) {
    return null;
  }
  return repo.markScheduled(sessionId, scheduledAt);
}

/** Rendez-vous clôturé : la séance est définitivement consommée. */
export async function complete(sessionId: string) {
  const session = await repo.findSessionById(sessionId);
  if (!session || session.status === "UTILISEE") {
    return null;
  }
  return repo.markUsed(sessionId);
}
