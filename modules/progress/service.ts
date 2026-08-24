import { AppError } from "@/lib/errors";
import * as repo from "@/modules/progress/repository";
import { COURSES_PER_LEVEL } from "@/modules/cursus/validation";
import { ensureDeadlineStarted } from "@/modules/deadlines/service";
import {
  ensureSessionsForCourse,
  ensureSessionsForPart,
} from "@/modules/sessions/service";

/**
 * Résumé d'un cours pour l'écran membre : titre/description propres au
 * cours, et le produit commercial à afficher pour un éventuel achat —
 * celui du cours pour le cursus, celui de la formation pour un cours de
 * formation (RÈGLES MÉTIER §18 : seule la formation porte un prix).
 */
export async function getCourseSummary(courseId: string) {
  const course = await repo.findCourseSummary(courseId);
  if (!course) {
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      "Cours introuvable.",
      undefined,
      "common.courseNotFound",
    );
  }
  const productId = course.formationPart
    ? (course.formationPart.formation.products[0]?.id ?? null)
    : (course.products[0]?.id ?? null);

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    titleEn: course.titleEn,
    descriptionEn: course.descriptionEn,
    productId,
  };
}

/** Point d'activation unique pour tout ce qui doit démarrer la première
 * fois qu'un cours devient réellement ACCESSIBLE pour un apprenant : le
 * délai (§23) et les trois séances (§21 — au niveau du cours pour le
 * cursus, de la partie pour une formation). */
async function activateCourse(
  userId: string,
  courseId: string,
  enrollmentId: string | null,
  formationPartId: string | null,
) {
  await ensureDeadlineStarted(userId, courseId, enrollmentId);
  if (formationPartId) {
    await ensureSessionsForPart(userId, formationPartId);
  } else {
    await ensureSessionsForCourse(userId, courseId);
  }
}

// États d'accès à un cours — sous-ensemble de ARCHITECTURE FRONTEND §63
// implémenté à ce stade (IN_PROGRESS, QUIZ_PENDING, VALIDATED arriveront
// avec un futur raffinement du module Quiz).
export type CourseAccessState =
  | "LOCKED"
  | "PURCHASE_REQUIRED"
  | "ACCESSIBLE"
  | "CLOSED_FOR_DELAY";

/**
 * Détermine si — et pourquoi — un utilisateur peut accéder à un cours.
 * Ne fait jamais confiance à un état envoyé par le frontend (PROMPT MASTER
 * BACKEND CORE §17 ACCÈS AUX COURS) : tout est recalculé ici à partir de
 * l'éligibilité persistée et, si le cours est payant, d'un accès actif.
 */
export async function getCourseAccessState(
  userId: string,
  courseId: string,
): Promise<CourseAccessState> {
  const course = await repo.findCourseWithProgress(courseId, userId);
  if (!course) {
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      "Cours introuvable.",
      undefined,
      "common.courseNotFound",
    );
  }

  const progress = course.courseProgress[0];
  if (progress?.eligibilityStatus === "FERME") {
    // RÈGLES MÉTIER §26 : fermé pour dépassement de délai — distinct d'un
    // simple LOCKED (jamais éligible) pour donner un message actionnable.
    return "CLOSED_FOR_DELAY";
  }
  if (!progress || progress.eligibilityStatus !== "ELIGIBLE") {
    return "LOCKED";
  }

  // Cours de formation : le prix et le produit commercial vivent au
  // niveau de la FORMATION, jamais du cours lui-même (RÈGLES MÉTIER §18 —
  // seule la formation porte un prix, ses parties/cours n'en ont pas).
  if (course.formationPart) {
    const formation = course.formationPart.formation;
    const isFree = formation.price === null || Number(formation.price) === 0;
    if (isFree) {
      await activateCourse(userId, courseId, progress.enrollmentId, course.formationPartId);
      return "ACCESSIBLE";
    }
    const product = formation.products[0];
    if (!product) {
      return "PURCHASE_REQUIRED";
    }
    const access = await repo.findActiveAccess(userId, product.id);
    if (!access) {
      return "PURCHASE_REQUIRED";
    }
    await activateCourse(userId, courseId, progress.enrollmentId, course.formationPartId);
    return "ACCESSIBLE";
  }

  const isFree = course.price === null || Number(course.price) === 0;
  if (isFree) {
    await activateCourse(userId, courseId, progress.enrollmentId, null);
    return "ACCESSIBLE";
  }

  const product = course.products[0];
  if (!product) {
    // Cours payant sans produit commercial encore créé par le Seuil :
    // ne peut pas être acheté, donc pas encore accessible.
    return "PURCHASE_REQUIRED";
  }

  const access = await repo.findActiveAccess(userId, product.id);
  if (!access) {
    return "PURCHASE_REQUIRED";
  }
  await activateCourse(userId, courseId, progress.enrollmentId, null);
  return "ACCESSIBLE";
}

/** Lève ACCESS_DENIED si l'état n'est pas ACCESSIBLE. À utiliser avant de
 * servir le contenu d'un cours (fichiers, quiz, etc.). */
export async function requireCourseAccess(userId: string, courseId: string) {
  const state = await getCourseAccessState(userId, courseId);
  if (state === "LOCKED") {
    throw new AppError(
      "COURSE_NOT_ELIGIBLE",
      "Ce cours n'est pas encore accessible.",
      undefined,
      "progress.courseNotEligible",
    );
  }
  if (state === "PURCHASE_REQUIRED") {
    throw new AppError(
      "PAYMENT_REQUIRED",
      "Ce cours doit être acheté.",
      undefined,
      "progress.purchaseRequired",
    );
  }
  if (state === "CLOSED_FOR_DELAY") {
    throw new AppError(
      "DEADLINE_EXCEEDED",
      "Ce cours a été fermé pour dépassement de délai. Une nouvelle acquisition peut être nécessaire.",
      undefined,
      "progress.closedForDelay",
    );
  }
}

export interface AdvanceResult {
  nextCourse: { id: string; title: string } | null;
  levelCompleted: { levelName: string; grade: { id: string; name: string } } | null;
  partCompleted: { partTitle: string } | null;
  formationCompleted: { formationName: string } | null;
}

/**
 * Marque un cours validé et fait progresser l'apprenant :
 * - position < 6 : débloque la position suivante DANS LE MÊME NIVEAU si
 *   elle existe déjà (sinon rien : le Seuil n'a pas encore ajouté ce
 *   cours, on ne doit surtout pas interpréter ça comme "niveau terminé").
 * - position === 6 (ARCHITECTURE GÉNÉRALE §93, dernier cours du niveau) :
 *   le niveau est complet → Passage + Grade (PROMPT MASTER PROGRESSION
 *   PÉDAGOGIQUE §31 PASSAGE DE NIVEAU), puis éligibilité au premier cours
 *   du niveau suivant s'il existe.
 * - cours de formation (hors cursus) : voir advanceFormationEligibility —
 *   logique symétrique, mais sans invariant de taille fixe (une formation
 *   n'a pas de nombre de parties/cours prédéfini comme le cursus).
 */
export async function advanceEligibility(
  userId: string,
  courseProgressId: string,
  courseId: string,
): Promise<AdvanceResult> {
  await repo.markCourseValidated(courseProgressId);

  const course = await repo.findCourseWithLevel(courseId);
  const enrollmentId = await repo.findEnrollmentForCourseProgress(
    courseProgressId,
  );

  if (course?.formationPart) {
    return advanceFormationEligibility(
      userId,
      enrollmentId,
      course.formationPart,
      course.position ?? 0,
    );
  }

  if (!course?.level) {
    return { nextCourse: null, levelCompleted: null, partCompleted: null, formationCompleted: null };
  }

  const position = course.position ?? 0;

  if (position < COURSES_PER_LEVEL) {
    const nextInLevel = await repo.findNextCourseInLevel(
      course.level.id,
      position,
    );
    if (!nextInLevel) {
      // Contenu du niveau pas encore complet côté Seuil : rien à faire,
      // surtout ne pas déclencher un passage de niveau prématuré.
      return { nextCourse: null, levelCompleted: null, partCompleted: null, formationCompleted: null };
    }
    await repo.grantEligibility(userId, nextInLevel.id, enrollmentId);
    return {
      nextCourse: { id: nextInLevel.id, title: nextInLevel.title },
      levelCompleted: null,
      partCompleted: null,
      formationCompleted: null,
    };
  }

  // position === COURSES_PER_LEVEL : dernier cours du niveau, complet.
  await repo.upsertLevelProgress(userId, course.level.id, enrollmentId, "VALIDE");

  const nextLevel = await repo.findNextLevel(
    course.level.cursusId,
    course.level.number,
  );
  const { grade } = await repo.recordPassageAndGrade(
    userId,
    course.level.id,
    nextLevel?.id ?? null,
    course.level.name,
  );

  let nextCourse: AdvanceResult["nextCourse"] = null;
  if (nextLevel) {
    const nextLevelFirstCourse = await repo.findFirstCourseOfNextLevel(
      course.level.cursusId,
      course.level.number,
    );
    if (nextLevelFirstCourse) {
      await repo.grantEligibility(userId, nextLevelFirstCourse.id, enrollmentId);
      nextCourse = { id: nextLevelFirstCourse.id, title: nextLevelFirstCourse.title };
    }
  }

  return {
    nextCourse,
    levelCompleted: {
      levelName: course.level.name,
      grade: { id: grade.id, name: grade.name },
    },
    partCompleted: null,
    formationCompleted: null,
  };
}

/**
 * Équivalent de la cascade ci-dessus pour un cours de formation. Une
 * formation n'a pas de nombre fixe de parties/cours (contrairement au
 * cursus, ARCHITECTURE GÉNÉRALE §93) : on ne peut donc jamais déduire
 * "dernier cours = partie/formation terminée" de la seule position.
 *
 * Décision produit (23/08/2026) : le statut PUBLIÉ d'une PARTIE ou d'une
 * FORMATION fait foi qu'elle est éditorialement complète — le Seuil ne
 * publie une partie/formation qu'une fois tout son contenu ajouté. Tant
 * qu'une partie/formation reste en BROUILLON, l'absence de cours/partie
 * suivant ne déclenche donc jamais de validation prématurée.
 */
async function advanceFormationEligibility(
  userId: string,
  enrollmentId: string | null,
  formationPart: {
    id: string;
    title: string;
    position: number;
    status: string;
    formationId: string;
    formation: { title: string; status: string };
  },
  position: number,
): Promise<AdvanceResult> {
  const nextInPart = await repo.findNextCourseInFormationPart(formationPart.id, position);
  if (nextInPart) {
    await repo.grantEligibility(userId, nextInPart.id, enrollmentId);
    return {
      nextCourse: { id: nextInPart.id, title: nextInPart.title },
      levelCompleted: null,
      partCompleted: null,
      formationCompleted: null,
    };
  }

  if (formationPart.status !== "PUBLIE") {
    // Le Seuil n'a pas encore fini d'ajouter les cours de cette partie.
    return { nextCourse: null, levelCompleted: null, partCompleted: null, formationCompleted: null };
  }

  // Dernier cours de la partie validé, et partie publiée (donc éditorialement
  // figée) : la partie elle-même est complète (§20 FORMATION_PART_VALIDATED).
  const partCompleted = { partTitle: formationPart.title };

  const nextPart = await repo.findNextFormationPart(formationPart.formationId, formationPart.position);
  if (nextPart) {
    const firstCourseOfNextPart = await repo.findFirstCourseOfFormationPart(nextPart.id);
    if (firstCourseOfNextPart) {
      await repo.grantEligibility(userId, firstCourseOfNextPart.id, enrollmentId);
      return {
        nextCourse: { id: firstCourseOfNextPart.id, title: firstCourseOfNextPart.title },
        levelCompleted: null,
        partCompleted,
        formationCompleted: null,
      };
    }
    // Partie suivante créée mais encore sans cours : rien à débloquer.
    return { nextCourse: null, levelCompleted: null, partCompleted, formationCompleted: null };
  }

  if (formationPart.formation.status !== "PUBLIE") {
    // Le Seuil n'a pas encore fini d'ajouter les parties de la formation.
    return { nextCourse: null, levelCompleted: null, partCompleted, formationCompleted: null };
  }

  // Dernière partie de la formation, elle-même publiée : formation complète.
  await repo.upsertFormationProgress(userId, formationPart.formationId, enrollmentId, "VALIDE");
  return {
    nextCourse: null,
    levelCompleted: null,
    partCompleted,
    formationCompleted: { formationName: formationPart.formation.title },
  };
}
