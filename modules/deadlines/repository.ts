import { db } from "@/lib/db";

// Accès base de données du système de délai à 3 alertes (calculs et
// orchestration dans modules/deadlines/service.ts). Chaque findDueForStageN
// correspond à une étape de la cascade ALERTE 1 (J+30) → ALERTE 2 (J+37) →
// ALERTE 3 = fermeture (J+44) — voir RÈGLES MÉTIER §23-26. Aucun calcul de
// date ici, uniquement des requêtes ; les dates elles-mêmes sont calculées
// côté service à partir de DEADLINE_DURATION_DAYS/ALERT_INTERVAL_DAYS.

export function findActiveDeadline(userId: string, courseId: string) {
  return db.deadline.findFirst({ where: { userId, courseId, status: "EN_COURS" } });
}

export function createDeadline(
  userId: string,
  courseId: string,
  enrollmentId: string | null,
  startAt: Date,
  dueAt: Date,
) {
  return db.deadline.create({
    data: { userId, courseId, enrollmentId, startAt, dueAt, status: "EN_COURS" },
  });
}

/** ALERTE 1 : délai dépassé, pas encore averti. */
export function findDueForStage1(now: Date) {
  return db.deadline.findMany({
    where: { status: "EN_COURS", dueAt: { lte: now }, warning1At: null },
  });
}

/** ALERTE 2 : ALERTE 1 envoyée il y a au moins ALERT_INTERVAL_DAYS. */
export function findDueForStage2(cutoff: Date) {
  return db.deadline.findMany({
    where: { status: "EN_COURS", warning1At: { lte: cutoff }, warning2At: null },
  });
}

/** ALERTE 3 (= fermeture) : ALERTE 2 envoyée il y a au moins ALERT_INTERVAL_DAYS. */
export function findDueForStage3(cutoff: Date) {
  return db.deadline.findMany({
    where: { status: "EN_COURS", warning2At: { lte: cutoff }, warning3At: null },
  });
}

export function markWarning1(id: string, at: Date) {
  return db.deadline.update({ where: { id }, data: { warning1At: at } });
}

export function markWarning2(id: string, at: Date) {
  return db.deadline.update({ where: { id }, data: { warning2At: at } });
}

/** ALERTE 3 et fermeture sont simultanées (RÈGLES MÉTIER §24 : "ALERTE 3 —
 * FERMETURE DU COURS"), pas deux étapes séparées dans le temps. */
export function markWarning3AndClose(id: string, at: Date) {
  return db.deadline.update({
    where: { id },
    data: { warning3At: at, status: "FERME", closedAt: at },
  });
}

export function findDeadlineById(id: string) {
  return db.deadline.findUnique({ where: { id } });
}

/** RÈGLES MÉTIER §25 : la réinitialisation ne supprime jamais l'historique
 * — seul le délai lui-même repart à zéro. */
export function resetDeadline(id: string, startAt: Date, dueAt: Date) {
  return db.deadline.update({
    where: { id },
    data: {
      startAt,
      dueAt,
      warning1At: null,
      warning2At: null,
      warning3At: null,
      status: "EN_COURS",
      closedAt: null,
    },
  });
}

export function listAllDeadlines() {
  return db.deadline.findMany({
    orderBy: { dueAt: "asc" },
    include: {
      user: { include: { profile: true } },
      course: { select: { id: true, title: true } },
    },
  });
}

/** Le cours à fermer peut appartenir au cursus (produit sur le cours) ou à
 * une formation (produit sur la formation, RÈGLES MÉTIER §18) — la
 * suspension de l'accès commercial doit viser la bonne entité. */
export function findCourseForClosure(courseId: string) {
  return db.course.findUnique({
    where: { id: courseId },
    include: {
      products: true,
      formationPart: { include: { formation: { include: { products: true } } } },
    },
  });
}

export function closeCourseProgress(userId: string, courseId: string) {
  return db.courseProgress.update({
    where: { userId_courseId: { userId, courseId } },
    data: { eligibilityStatus: "FERME" },
  });
}

export function suspendAccess(userId: string, productId: string) {
  return db.access.updateMany({
    where: { userId, productId, status: "ACTIF" },
    data: { status: "SUSPENDU", suspendedAt: new Date() },
  });
}
