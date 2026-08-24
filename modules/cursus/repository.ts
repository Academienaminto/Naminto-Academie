import { db } from "@/lib/db";
import type {
  CreateCourseInput,
  CreateCursusInput,
  CreateLevelInput,
} from "@/modules/cursus/validation";

// Accès base de données de la structure éditoriale CURSUS → NIVEAU → COURS
// (gérée par modules/cursus/service.ts). Distinct de la progression d'un
// apprenant (modules/progress) : ici on lit/écrit uniquement le contenu tel
// que rédigé par le Seuil, jamais l'éligibilité ou l'avancement d'un
// utilisateur — c'est la couche CONTENU du flux pédagogique, pas ACCÈS.

export function listPublishedCursus() {
  return db.cursus.findMany({
    where: { status: "PUBLIE" },
    orderBy: { createdAt: "asc" },
    include: {
      levels: {
        orderBy: { number: "asc" },
        include: { courses: { orderBy: { position: "asc" } } },
      },
    },
  });
}

/** Vue Seuil : tous les statuts, y compris brouillon. */
export function listAllCursus() {
  return db.cursus.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      levels: {
        orderBy: { number: "asc" },
        include: { courses: { orderBy: { position: "asc" } } },
      },
    },
  });
}

export function findCursusById(id: string) {
  return db.cursus.findUnique({
    where: { id },
    include: {
      levels: {
        orderBy: { number: "asc" },
        include: { courses: { orderBy: { position: "asc" } } },
      },
    },
  });
}

export function createCursus(input: CreateCursusInput) {
  return db.cursus.create({
    data: { ...input, status: "BROUILLON" },
  });
}

export function updateCursus(
  id: string,
  data: Partial<CreateCursusInput> & { status?: string },
) {
  return db.cursus.update({ where: { id }, data });
}

export function findLevelByCursusAndNumber(cursusId: string, number: number) {
  return db.level.findUnique({
    where: { cursusId_number: { cursusId, number } },
  });
}

export function createLevel(cursusId: string, input: CreateLevelInput) {
  return db.level.create({
    data: { ...input, cursusId, status: "BROUILLON" },
  });
}

export function findLevelById(id: string) {
  return db.level.findUnique({
    where: { id },
    include: { courses: { orderBy: { position: "asc" } }, cursus: true },
  });
}

export function findCourseByLevelAndPosition(
  levelId: string,
  position: number,
) {
  return db.course.findUnique({
    where: { levelId_position: { levelId, position } },
  });
}

/**
 * Crée le cours et, s'il est payant, le produit commercial correspondant
 * dans la même transaction (voir MODÈLE DE DONNÉES §36 PRODUCT :
 * PRODUCT.course_id est le lien direct utilisé par le module Paiements
 * pour retrouver quoi vendre — un cours payant sans Product ne serait
 * jamais achetable).
 */
export function createCourse(input: CreateCourseInput) {
  return db.$transaction(async (tx) => {
    const course = await tx.course.create({
      data: {
        levelId: input.levelId,
        position: input.position,
        title: input.title,
        description: input.description,
        titleEn: input.titleEn,
        descriptionEn: input.descriptionEn,
        price: input.price,
        currency: input.currency,
        duration: input.duration,
        status: "BROUILLON",
      },
    });

    if (input.price && input.price > 0) {
      await tx.product.create({
        data: {
          type: "COURSE",
          courseId: course.id,
          title: course.title,
          price: input.price,
          currency: input.currency,
          status: "ACTIF",
        },
      });
    }

    return course;
  });
}

export function findCourseById(id: string) {
  return db.course.findUnique({
    where: { id },
    include: {
      level: { include: { cursus: true } },
      quiz: true,
      versions: { orderBy: { versionNumber: "desc" } },
    },
  });
}

export function findLatestCourseVersion(courseId: string) {
  return db.courseVersion.findFirst({
    where: { courseId },
    orderBy: { versionNumber: "desc" },
  });
}

/** Même principe que les versions de livre (RÈGLES MÉTIER §42, par
 * analogie) : publiée dès son ajout, pas de brouillon intermédiaire — le
 * droit d'accès au téléchargement reste lié à l'accès au cours (paiement),
 * jamais à la version elle-même. */
export function createCourseVersion(
  courseId: string,
  versionNumber: number,
  fileId: string,
) {
  return db.courseVersion.create({
    data: { courseId, versionNumber, fileId, status: "PUBLIE", publishedAt: new Date() },
  });
}

export function findLatestPublishedCourseVersion(courseId: string) {
  return db.courseVersion.findFirst({
    where: { courseId, status: "PUBLIE" },
    orderBy: { versionNumber: "desc" },
    include: { file: true },
  });
}

export function recordCourseDownload(userId: string, fileId: string) {
  return db.download.create({
    data: { userId, fileId, status: "TERMINE", completedAt: new Date() },
  });
}

export function updateCourseStatus(id: string, status: string) {
  const data: { status: string; publishedAt?: Date } = { status };
  if (status === "PUBLIE") {
    data.publishedAt = new Date();
  }
  return db.course.update({ where: { id }, data });
}
