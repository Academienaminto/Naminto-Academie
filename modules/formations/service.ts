import { AppError } from "@/lib/errors";
import * as repo from "@/modules/formations/repository";
import type {
  CreateFormationCourseInput,
  CreateFormationInput,
  CreateFormationPartInput,
} from "@/modules/formations/validation";
import type { PublishInput } from "@/modules/cursus/validation";

// RÈGLES MÉTIER §18-20 : FORMATION → PARTIE → COURS, indépendante du
// cursus initiatique, avec sa propre règle d'accès (achat) et sa propre
// progression (ACCÈS → ÉTUDE → QUIZ → CORRECTION → VALIDATION → PARTIE
// SUIVANTE). Ce module gère la structure éditoriale ; la progression d'un
// apprenant est gérée par modules/progress (advanceFormationEligibility).

export function listCatalog() {
  return repo.listPublishedFormations();
}

export function listAll() {
  return repo.listAllFormations();
}

export async function getFormation(id: string) {
  const formation = await repo.findFormationById(id);
  if (!formation) {
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      "Formation introuvable.",
      undefined,
      "common.formationNotFound",
    );
  }
  return formation;
}

export function createFormation(input: CreateFormationInput) {
  return repo.createFormation(input);
}

/**
 * Publier une formation. Décision produit (23/08/2026, voir
 * modules/progress/service.ts advanceFormationEligibility) : le Seuil ne
 * doit publier qu'une fois toutes les parties/cours ajoutés — le statut
 * PUBLIÉ sert aussi de signal "contenu éditorialement complet" pour la
 * cascade de progression, faute d'invariant de taille fixe comme le
 * cursus (9 niveaux × 6 cours).
 */
export async function setFormationStatus(id: string, input: PublishInput) {
  await getFormation(id); // 404 si absent
  return repo.updateFormationStatus(id, input.status);
}

export async function addPart(formationId: string, input: CreateFormationPartInput) {
  const formation = await repo.findFormationById(formationId);
  if (!formation) {
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      "Formation introuvable.",
      undefined,
      "common.formationNotFound",
    );
  }

  const existing = await repo.findPartByFormationAndPosition(
    formationId,
    input.position,
  );
  if (existing) {
    throw new AppError(
      "CONFLICT",
      `La position ${input.position} est déjà occupée dans cette formation.`,
    );
  }

  return repo.createPart(formationId, input);
}

export async function getPart(id: string) {
  const part = await repo.findPartById(id);
  if (!part) {
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      "Partie de formation introuvable.",
      undefined,
      "common.formationPartNotFound",
    );
  }
  return part;
}

export async function setPartStatus(id: string, input: PublishInput) {
  await getPart(id); // 404 si absent
  return repo.updatePartStatus(id, input.status);
}

export async function addCourse(input: CreateFormationCourseInput) {
  const part = await repo.findPartById(input.formationPartId);
  if (!part) {
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      "Partie de formation introuvable.",
      undefined,
      "common.formationPartNotFound",
    );
  }

  const existing = await repo.findCourseByPartAndPosition(
    input.formationPartId,
    input.position,
  );
  if (existing) {
    throw new AppError(
      "CONFLICT",
      `La position ${input.position} est déjà occupée dans cette partie.`,
    );
  }

  return repo.createFormationCourse(input);
}

export async function getCourse(id: string) {
  const course = await repo.findFormationCourseById(id);
  if (!course) {
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      "Cours introuvable.",
      undefined,
      "common.courseNotFound",
    );
  }
  return course;
}

/**
 * Inscription à une formation — gratuite et distincte de l'achat
 * (RÈGLES MÉTIER §18-19, symétrique à modules/enrollment/service.ts pour
 * le cursus) : elle ouvre l'éligibilité au premier cours quel que soit le
 * prix de la formation. L'accès réel au contenu, lui, dépend ensuite du
 * prix : voir modules/progress/service.ts getCourseAccessState.
 */
export async function enroll(userId: string, formationId: string) {
  const formation = await repo.findFormationById(formationId);
  if (!formation || formation.status !== "PUBLIE") {
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      "Formation introuvable.",
      undefined,
      "common.formationNotFound",
    );
  }

  // TODO: race condition — voir modules/formations/repository.ts
  // findEnrollment/createEnrollment : ce contrôle "existe déjà" puis
  // création n'est pas atomique et Enrollment n'a pas de contrainte
  // @@unique(userId, formationId) pour rattraper une double écriture.
  const existing = await repo.findEnrollment(userId, formationId);
  if (existing) {
    throw new AppError(
      "CONFLICT",
      "Déjà inscrit à cette formation.",
      undefined,
      "formations.alreadyEnrolled",
    );
  }

  const enrollment = await repo.createEnrollment(userId, formationId);

  const apprenantRole = await repo.findApprenantRole();
  await repo.grantRole(userId, apprenantRole.id);

  const firstCourse = await repo.findFirstCourse(formationId);
  if (firstCourse) {
    await repo.grantEligibility(userId, firstCourse.id, enrollment.id);
  }
  // Si le premier cours n'existe pas encore (formation publiée sans
  // contenu — ne devrait pas arriver vu la règle de publication
  // ci-dessus, mais reste défensif), l'inscription reste valide.

  return enrollment;
}
