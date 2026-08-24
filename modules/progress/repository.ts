import { db } from "@/lib/db";

// Accès base de données du moteur de progression (modules/progress/service.ts) :
// lecture de l'état cours/éligibilité, octroi d'éligibilité au cours
// suivant, passage de niveau + grade, progression de partie/formation.
// Aucune règle métier ici — uniquement des requêtes Prisma ; les décisions
// (quand débloquer, quand valider un niveau/une partie) restent côté service.

export function findCourseWithProgress(courseId: string, userId: string) {
  return db.course.findUnique({
    where: { id: courseId },
    include: {
      courseProgress: { where: { userId } },
      products: true,
      formationPart: { include: { formation: { include: { products: true } } } },
    },
  });
}

/** Résumé d'affichage indépendant de l'utilisateur (titre, description,
 * produit commercial associé) — utilisé par l'écran "cours" côté membre,
 * qui a besoin de ces informations même quand le cours est encore verrouillé. */
export function findCourseSummary(courseId: string) {
  return db.course.findUnique({
    where: { id: courseId },
    include: {
      products: true,
      formationPart: { include: { formation: { include: { products: true } } } },
    },
  });
}

export function findActiveAccess(userId: string, productId: string) {
  return db.access.findFirst({
    where: { userId, productId, status: "ACTIF" },
  });
}

export function findCourseWithLevel(courseId: string) {
  return db.course.findUnique({
    where: { id: courseId },
    include: { level: true, formationPart: { include: { formation: true } } },
  });
}

/** Cours suivant dans le même niveau (position + 1). */
export function findNextCourseInLevel(levelId: string, position: number) {
  return db.course.findUnique({
    where: { levelId_position: { levelId, position: position + 1 } },
  });
}

/** Premier cours (position 1) du niveau suivant dans le même cursus. */
export function findFirstCourseOfNextLevel(cursusId: string, levelNumber: number) {
  return db.course.findFirst({
    where: { level: { cursusId, number: levelNumber + 1 }, position: 1 },
  });
}

export function findEnrollmentForCourseProgress(courseProgressId: string) {
  return db.courseProgress
    .findUnique({ where: { id: courseProgressId } })
    .then((cp) => cp?.enrollmentId ?? null);
}

// upsert sur la contrainte @@unique([userId, courseId]) de CourseProgress :
// contrairement au comptage de tentatives de quiz ou à la création
// d'inscription (voir TODO dans modules/quiz et modules/enrollment), cet
// octroi d'éligibilité est nativement race-safe même en cas d'appels
// concurrents, la contrainte unique faisant office de verrou côté base.
export function grantEligibility(
  userId: string,
  courseId: string,
  enrollmentId: string | null,
) {
  return db.courseProgress.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: { eligibilityStatus: "ELIGIBLE" },
    create: {
      userId,
      courseId,
      enrollmentId,
      eligibilityStatus: "ELIGIBLE",
      status: "NON_COMMENCE",
    },
  });
}

export function markCourseValidated(courseProgressId: string) {
  return db.courseProgress.update({
    where: { id: courseProgressId },
    data: { status: "VALIDE", validatedAt: new Date() },
  });
}

export function findLevelById(id: string) {
  return db.level.findUnique({ where: { id } });
}

/** Niveau suivant dans le même cursus (numéro + 1). */
export function findNextLevel(cursusId: string, number: number) {
  return db.level.findUnique({
    where: { cursusId_number: { cursusId, number: number + 1 } },
  });
}

export function upsertLevelProgress(
  userId: string,
  levelId: string,
  enrollmentId: string | null,
  status: string,
) {
  return db.levelProgress.upsert({
    where: { userId_levelId: { userId, levelId } },
    update: { status, validatedAt: status === "VALIDE" ? new Date() : undefined },
    create: {
      userId,
      levelId,
      enrollmentId,
      status,
      validatedAt: status === "VALIDE" ? new Date() : undefined,
    },
  });
}

/**
 * Passage de niveau + attribution du grade dans une seule transaction :
 * un passage ne doit jamais exister sans grade cohérent, ni l'inverse
 * (STACK TECHNIQUE §74 ERREURS ET ROLLBACK).
 */
export async function recordPassageAndGrade(
  userId: string,
  fromLevelId: string,
  toLevelId: string | null,
  gradeName: string,
) {
  return db.$transaction(async (tx) => {
    const passage = await tx.passage.create({
      data: {
        userId,
        fromLevelId,
        toLevelId: toLevelId ?? fromLevelId, // dernier niveau : pas de "vers", on référence le niveau complété
        status: "CONFIRME",
        confirmedAt: new Date(),
      },
    });

    const grade = await tx.grade.create({
      data: {
        userId,
        passageId: passage.id,
        levelId: fromLevelId,
        name: gradeName,
        status: "ACTIF",
        grantedAt: new Date(),
      },
    });

    return { passage, grade };
  });
}

/** Cours suivant dans la même partie de formation (position + 1). */
export function findNextCourseInFormationPart(
  formationPartId: string,
  position: number,
) {
  return db.course.findUnique({
    where: {
      formationPartId_position: { formationPartId, position: position + 1 },
    },
  });
}

/** Partie suivante de la formation (position + 1). */
export function findNextFormationPart(formationId: string, position: number) {
  return db.formationPart.findFirst({
    where: { formationId, position: position + 1 },
  });
}

/** Premier cours (position 1) d'une partie de formation. */
export function findFirstCourseOfFormationPart(formationPartId: string) {
  return db.course.findFirst({ where: { formationPartId, position: 1 } });
}

export function upsertFormationProgress(
  userId: string,
  formationId: string,
  enrollmentId: string | null,
  status: string,
) {
  return db.formationProgress.upsert({
    where: { userId_formationId: { userId, formationId } },
    update: { status, validatedAt: status === "VALIDE" ? new Date() : undefined },
    create: {
      userId,
      formationId,
      enrollmentId,
      status,
      validatedAt: status === "VALIDE" ? new Date() : undefined,
    },
  });
}
