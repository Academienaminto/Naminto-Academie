import { AppError } from "@/lib/errors";
import * as repo from "@/modules/enrollment/repository";

// ARCHITECTURE GÉNÉRALE §6 : INSCRIPTION → ACHAT → PAIEMENT → DROIT D'ACCÈS.
// L'inscription (Enrollment) est gratuite et distincte de l'achat d'un
// cours : elle déclare l'apprenant dans le cursus et ouvre l'éligibilité
// au premier cours uniquement. Voir PROMPT MASTER AUTHENTIFICATION §35 :
// MEMBRE ≠ ACHETEUR ≠ APPRENANT.

export async function enroll(userId: string, cursusId: string) {
  const cursus = await repo.findCursus(cursusId);
  if (!cursus || cursus.status !== "PUBLIE") {
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      "Cursus introuvable.",
      undefined,
      "common.cursusNotFound",
    );
  }

  // TODO: race condition — voir modules/enrollment/repository.ts
  // findEnrollment/createEnrollment : ce contrôle "existe déjà" puis
  // création n'est pas atomique et Enrollment n'a pas de contrainte
  // @@unique(userId, cursusId) pour rattraper une double écriture.
  const existing = await repo.findEnrollment(userId, cursusId);
  if (existing) {
    throw new AppError(
      "CONFLICT",
      "Déjà inscrit à ce cursus.",
      undefined,
      "enrollment.alreadyEnrolled",
    );
  }

  const enrollment = await repo.createEnrollment(userId, cursusId);

  const apprenantRole = await repo.findApprenantRole();
  await repo.grantRole(userId, apprenantRole.id);

  const firstCourse = await repo.findFirstCourse(cursusId);
  if (firstCourse) {
    await repo.createCourseProgress(
      userId,
      firstCourse.id,
      enrollment.id,
      "ELIGIBLE",
    );
  }
  // Si le premier cours n'existe pas encore (cursus publié sans contenu),
  // l'inscription reste valide : l'éligibilité sera accordée dès que le
  // Seuil ajoutera le cours niveau 1 / position 1.

  return enrollment;
}

export function listMine(userId: string) {
  return repo.listMyEnrollments(userId);
}
