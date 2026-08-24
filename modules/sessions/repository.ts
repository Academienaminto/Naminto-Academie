import { db } from "@/lib/db";

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
