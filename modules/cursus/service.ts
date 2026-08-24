import { AppError } from "@/lib/errors";
import * as storage from "@/lib/storage/r2";
import { requireCourseAccess } from "@/modules/progress/service";
import * as repo from "@/modules/cursus/repository";
import type {
  AddCourseVersionInput,
  CreateCourseInput,
  CreateCursusInput,
  CreateLevelInput,
  PublishInput,
  UpdateCursusInput,
} from "@/modules/cursus/validation";

// PROMPT MASTER PROGRESSION PÉDAGOGIQUE : CONTENU → APPRENTISSAGE → QUIZ →
// CORRECTION → SCORE → VALIDATION → PROGRESSION → ACCÈS SUIVANT.
// Ce module gère uniquement la structure du contenu (CURSUS → NIVEAU →
// COURS) ; la progression d'un apprenant est un domaine distinct
// (modules/progress, à venir).

export function listCatalog() {
  return repo.listPublishedCursus();
}

export function listAll() {
  return repo.listAllCursus();
}

/**
 * canManageAll=false (lecture publique) : un cursus non publié répond 404,
 * comme s'il n'existait pas — même garde que modules/books/service.ts
 * getBook. Le Seuil (MANAGE_CURSUS) passe canManageAll=true pour voir ses
 * propres brouillons.
 */
export async function getCursus(id: string, canManageAll = false) {
  const cursus = await repo.findCursusById(id);
  if (!cursus || (!canManageAll && cursus.status !== "PUBLIE")) {
    throw new AppError("RESOURCE_NOT_FOUND", "Cursus introuvable.");
  }
  return cursus;
}

export function createCursus(input: CreateCursusInput) {
  return repo.createCursus(input);
}

export async function updateCursus(id: string, input: UpdateCursusInput) {
  await getCursus(id, true); // 404 si absent ; Seuil, doit voir les brouillons
  return repo.updateCursus(id, input);
}

export async function addLevel(cursusId: string, input: CreateLevelInput) {
  const cursus = await repo.findCursusById(cursusId);
  if (!cursus) {
    throw new AppError("RESOURCE_NOT_FOUND", "Cursus introuvable.");
  }

  const existing = await repo.findLevelByCursusAndNumber(
    cursusId,
    input.number,
  );
  if (existing) {
    throw new AppError(
      "CONFLICT",
      `Le niveau ${input.number} existe déjà pour ce cursus.`,
    );
  }

  return repo.createLevel(cursusId, input);
}

export async function getLevel(id: string) {
  const level = await repo.findLevelById(id);
  if (!level) {
    throw new AppError("RESOURCE_NOT_FOUND", "Niveau introuvable.");
  }
  return level;
}

export async function addCourse(input: CreateCourseInput) {
  const level = await repo.findLevelById(input.levelId);
  if (!level) {
    throw new AppError("RESOURCE_NOT_FOUND", "Niveau introuvable.");
  }

  const existing = await repo.findCourseByLevelAndPosition(
    input.levelId,
    input.position,
  );
  if (existing) {
    throw new AppError(
      "CONFLICT",
      `La position ${input.position} est déjà occupée dans ce niveau.`,
    );
  }

  return repo.createCourse(input);
}

/** canManageAll=false (lecture publique) : un cours non publié répond 404 —
 * même garde que getCursus ci-dessus. */
export async function getCourse(id: string, canManageAll = false) {
  const course = await repo.findCourseById(id);
  if (!course || (!canManageAll && course.status !== "PUBLIE")) {
    throw new AppError("RESOURCE_NOT_FOUND", "Cours introuvable.");
  }
  return course;
}

/**
 * Publier un cours. Le téléchargement, l'achat ou la progression ne
 * constituent jamais une condition de publication éditoriale (distinct de
 * l'éligibilité pédagogique — voir COURSE_PROGRESS.eligibilityStatus).
 */
export async function setCourseStatus(id: string, input: PublishInput) {
  await getCourse(id, true); // 404 si absent ; Seuil, doit voir les brouillons
  return repo.updateCourseStatus(id, input.status);
}

/**
 * Matériel du cours (RÈGLES MÉTIER — le Seuil rédige/uploade le contenu
 * d'un cours ; le membre y accède une fois son droit d'accès confirmé).
 * Le fichier doit déjà avoir été uploadé via POST /api/v1/files.
 */
export async function addCourseVersion(courseId: string, input: AddCourseVersionInput) {
  await getCourse(courseId, true); // 404 si absent ; Seuil, doit voir les brouillons
  const latest = await repo.findLatestCourseVersion(courseId);
  const versionNumber = (latest?.versionNumber ?? 0) + 1;
  return repo.createCourseVersion(courseId, versionNumber, input.fileId);
}

/**
 * Téléchargement du matériel d'un cours — n'accorde jamais l'accès à
 * partir d'un état envoyé par le frontend : requireCourseAccess recalcule
 * tout côté serveur (éligibilité, paiement, délai), même logique que
 * modules/books mais réutilisant le moteur d'accès aux cours existant
 * plutôt qu'une vérification d'Access dupliquée.
 */
export async function getCourseDownloadUrl(userId: string, courseId: string) {
  await requireCourseAccess(userId, courseId);

  const version = await repo.findLatestPublishedCourseVersion(courseId);
  if (!version?.file) {
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      "Aucun fichier disponible pour ce cours.",
      undefined,
      "courses.noFileAvailable",
    );
  }

  let url: string;
  try {
    url = await storage.getSignedDownloadUrl(version.file.storageReference);
  } catch (err) {
    console.error("[r2-signed-url-failed]", err);
    throw new AppError(
      "INTERNAL_ERROR",
      "Impossible de générer le lien de téléchargement pour le moment.",
      undefined,
      "common.downloadLinkFailed",
    );
  }

  await repo.recordCourseDownload(userId, version.file.id);
  return url;
}
