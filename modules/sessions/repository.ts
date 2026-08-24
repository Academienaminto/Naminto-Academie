import { db } from "@/lib/db";

// Accès base de données des séances pédagogiques (RÈGLES MÉTIER §21-22,
// orchestrées par modules/sessions/service.ts) : 3 séances par cours du
// cursus, ou 3 par partie pour une formation (jamais par cours de
// formation). Voir le commentaire sur createSessionsForCourse pour le rôle
// de skipDuplicates + des contraintes @@unique dans la protection contre
// les appels concurrents.

export const SESSIONS_PER_UNIT = 3;

export function findSessionsForCourse(userId: string, courseId: string) {
  return db.learningSession.findMany({
    where: { userId, courseId },
    orderBy: { sessionNumber: "asc" },
  });
}

export function findSessionsForPart(userId: string, formationPartId: string) {
  return db.learningSession.findMany({
    where: { userId, formationPartId },
    orderBy: { sessionNumber: "asc" },
  });
}

/** `skipDuplicates` rend l'appel idempotent au niveau base de données
 * (contrainte unique userId+courseId+sessionNumber) — nécessaire car
 * plusieurs requêtes concurrentes peuvent chacune passer le contrôle
 * applicatif "aucune séance existante" avant que l'une d'elles n'écrive
 * (bug constaté le 23/08/2026 : double navigation quasi simultanée créant
 * 6 séances au lieu de 3 avec un simple contrôle applicatif). */
export function createSessionsForCourse(userId: string, courseId: string) {
  return db.learningSession.createMany({
    data: Array.from({ length: SESSIONS_PER_UNIT }, (_, i) => ({
      userId,
      courseId,
      sessionNumber: i + 1,
      status: "DISPONIBLE",
    })),
    skipDuplicates: true,
  });
}

/** Même principe que createSessionsForCourse ci-dessus (skipDuplicates +
 * contrainte @@unique([userId, formationPartId, sessionNumber]) en base) —
 * niveau "partie de formation" plutôt que "cours du cursus", RÈGLES
 * MÉTIER §21. */
export function createSessionsForPart(userId: string, formationPartId: string) {
  return db.learningSession.createMany({
    data: Array.from({ length: SESSIONS_PER_UNIT }, (_, i) => ({
      userId,
      formationPartId,
      sessionNumber: i + 1,
      status: "DISPONIBLE",
    })),
    skipDuplicates: true,
  });
}

export function findSessionById(id: string) {
  return db.learningSession.findUnique({ where: { id } });
}

export function markReserved(id: string) {
  return db.learningSession.update({ where: { id }, data: { status: "RESERVEE" } });
}

export function markAvailable(id: string) {
  return db.learningSession.update({
    where: { id },
    data: { status: "DISPONIBLE", scheduledAt: null },
  });
}

export function markScheduled(id: string, scheduledAt: Date) {
  return db.learningSession.update({
    where: { id },
    data: { status: "RESERVEE", scheduledAt },
  });
}

export function markUsed(id: string) {
  return db.learningSession.update({
    where: { id },
    data: { status: "UTILISEE", completedAt: new Date() },
  });
}

export function findCourseForSessions(courseId: string) {
  return db.course.findUnique({
    where: { id: courseId },
    select: { id: true, formationPartId: true },
  });
}
