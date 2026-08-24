import { AppError } from "@/lib/errors";
import { recordEvent } from "@/lib/events/record";
import { recordAudit } from "@/lib/audit/record";
import { notify } from "@/modules/notifications/service";
import * as repo from "@/modules/quiz/repository";
import * as progressService from "@/modules/progress/service";
import type {
  CreateQuestionInput,
  CreateQuizInput,
  SubmitAttemptInput,
} from "@/modules/quiz/validation";

// RÈGLES MÉTIER — valeur par défaut (23/08/2026, ajustable) : 3 tentatives
// avant blocage et nécessité de contacter le Seuil.
const MAX_ATTEMPTS = 3;

/**
 * Vue apprenant agrégée pour l'écran "cours" : quiz (forme sûre, jamais
 * isCorrect), tentatives déjà faites, tentative en cours à reprendre le
 * cas échéant. Retourne null si le cours n'a pas de quiz (RÈGLES MÉTIER :
 * un cours de formation peut ne pas en avoir).
 */
export async function getCourseQuizStatus(userId: string, courseId: string) {
  const quiz = await repo.findQuizByCourseId(courseId);
  if (!quiz || quiz.status !== "PUBLIE") {
    return null;
  }

  const safeQuiz = await repo.findQuizForAttempt(quiz.id);
  if (!safeQuiz) {
    return null; // ne devrait pas arriver (quiz.id vient d'être trouvé) — défensif
  }
  const attempts = await repo.findMyAttempts(userId, quiz.id);
  const passed = attempts.some((a) => a.status === "REUSSI");
  const pendingAttempt = attempts.find(
    (a) => a.status === "EN_COURS" || a.status === "EN_ATTENTE_VALIDATION",
  );

  return {
    quiz: safeQuiz,
    attempts,
    passed,
    pendingAttempt: pendingAttempt ?? null,
    attemptsUsed: attempts.length,
    maxAttempts: MAX_ATTEMPTS,
  };
}

/** Vue Seuil pour l'écran de gestion d'un quiz (isCorrect inclus) — null si
 * le cours n'a pas encore de quiz. */
export function getQuizForCourseAdmin(courseId: string) {
  return repo.findQuizByCourseIdWithQuestions(courseId);
}

export async function createQuiz(courseId: string, input: CreateQuizInput) {
  const course = await repo.findCourseById(courseId);
  if (!course) {
    throw new AppError("RESOURCE_NOT_FOUND", "Cours introuvable.");
  }

  const existing = await repo.findQuizByCourseId(courseId);
  if (existing) {
    throw new AppError("CONFLICT", "Ce cours possède déjà un quiz.");
  }

  return repo.createQuiz(courseId, input);
}

/** Un quiz créé reste en BROUILLON tant que le Seuil ne le publie pas
 * explicitement — invisible et non commençable par un apprenant jusque-là
 * (voir getCourseQuizStatus). Publication refusée sans au moins une
 * question : un quiz vide ne serait jamais franchissable. */
export async function setQuizStatus(quizId: string, status: string) {
  const quiz = await repo.findQuizById(quizId);
  if (!quiz) {
    throw new AppError("RESOURCE_NOT_FOUND", "Quiz introuvable.");
  }
  if (status === "PUBLIE" && quiz.questions.length === 0) {
    throw new AppError(
      "INVALID_STATE",
      "Impossible de publier un quiz sans question.",
    );
  }
  return repo.updateQuizStatus(quizId, status);
}

export async function addQuestion(quizId: string, input: CreateQuestionInput) {
  const quiz = await repo.findQuizById(quizId);
  if (!quiz) {
    throw new AppError("RESOURCE_NOT_FOUND", "Quiz introuvable.");
  }

  const existing = await repo.findQuestionByPosition(quizId, input.position);
  if (existing) {
    throw new AppError(
      "CONFLICT",
      `La position ${input.position} est déjà occupée dans ce quiz.`,
    );
  }

  return repo.createQuestion(quizId, input);
}

/**
 * Démarre une tentative. Exige un accès réel au cours (§17 ACCÈS AUX
 * COURS) : jamais uniquement parce que l'identifiant du quiz est connu.
 */
export async function startAttempt(userId: string, quizId: string) {
  const quiz = await repo.findQuizForAttempt(quizId);
  if (!quiz) {
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      "Quiz introuvable.",
      undefined,
      "quiz.notFound",
    );
  }

  await progressService.requireCourseAccess(userId, quiz.courseId);

  const alreadyPassed = await repo.findPassedAttempt(userId, quizId);
  if (alreadyPassed) {
    throw new AppError(
      "CONFLICT",
      "Ce quiz a déjà été validé.",
      undefined,
      "quiz.alreadyPassed",
    );
  }

  const attemptCount = await repo.countAttempts(userId, quizId);
  if (attemptCount >= MAX_ATTEMPTS) {
    throw new AppError(
      "QUIZ_NOT_AVAILABLE",
      "Nombre de tentatives maximum atteint. Contactez le Seuil.",
      undefined,
      "quiz.maxAttemptsReached",
    );
  }

  const progress = await repo.findCourseProgress(userId, quiz.courseId);

  const attempt = await repo.createAttempt(
    userId,
    quizId,
    progress?.id,
    attemptCount + 1,
  );

  return { attempt, quiz };
}

/**
 * Applique les conséquences d'une tentative réussie : validation du cours,
 * cascade d'éligibilité / passage de niveau, notifications. Partagé entre
 * la correction immédiate (quiz 100% à choix) et la finalisation différée
 * (quiz avec preuve pratique, une fois la dernière preuve revue).
 */
async function applyPassedConsequences(
  userId: string,
  courseId: string,
  courseProgressId: string,
  scorePercent: number,
  attemptId: string,
) {
  const validatedEvent = await recordEvent({
    type: "COURSE_VALIDATED",
    userId,
    entityType: "COURSE",
    entityId: courseId,
    payload: { scorePercent, attemptId },
  });
  await notify({
    userId,
    eventId: validatedEvent.id,
    type: "COURSE_VALIDATED",
    title: "Cours validé",
    message: `Félicitations, vous avez validé ce cours avec ${scorePercent}%.`,
  });

  const result = await progressService.advanceEligibility(
    userId,
    courseProgressId,
    courseId,
  );

  if (result.levelCompleted) {
    const levelEvent = await recordEvent({
      type: "LEVEL_VALIDATED",
      userId,
      entityType: "LEVEL",
      entityId: courseId,
      payload: { levelName: result.levelCompleted.levelName },
    });
    await notify({
      userId,
      eventId: levelEvent.id,
      type: "LEVEL_VALIDATED",
      title: "Niveau validé",
      message: `Vous avez complété le niveau « ${result.levelCompleted.levelName} ».`,
    });

    const gradeEvent = await recordEvent({
      type: "GRADE_GRANTED",
      userId,
      entityType: "GRADE",
      entityId: result.levelCompleted.grade.id,
    });
    await notify({
      userId,
      eventId: gradeEvent.id,
      type: "GRADE_GRANTED",
      title: "Grade obtenu",
      message: `Le grade « ${result.levelCompleted.grade.name} » vous a été attribué.`,
    });
  }

  if (result.partCompleted) {
    const partEvent = await recordEvent({
      type: "FORMATION_PART_VALIDATED",
      userId,
      entityType: "FORMATION_PART",
      entityId: courseId,
      payload: { partTitle: result.partCompleted.partTitle },
    });
    await notify({
      userId,
      eventId: partEvent.id,
      type: "FORMATION_PART_VALIDATED",
      title: "Partie validée",
      message: `Vous avez complété la partie « ${result.partCompleted.partTitle} ».`,
    });
  }

  if (result.formationCompleted) {
    await notify({
      userId,
      type: "FORMATION_PART_VALIDATED",
      title: "Formation terminée",
      message: `Félicitations, vous avez terminé la formation « ${result.formationCompleted.formationName} ».`,
    });
  }

  if (result.nextCourse) {
    const eligibilityEvent = await recordEvent({
      type: "COURSE_ELIGIBILITY_GRANTED",
      userId,
      entityType: "COURSE",
      entityId: result.nextCourse.id,
    });
    await notify({
      userId,
      eventId: eligibilityEvent.id,
      type: "COURSE_ELIGIBILITY_GRANTED",
      title: "Nouveau cours débloqué",
      message: `« ${result.nextCourse.title} » est maintenant accessible.`,
    });
  }
}

/**
 * Corrige une tentative. La correction et le score sont calculés
 * exclusivement côté serveur (§31 SCORE) : le frontend ne transmet que les
 * options sélectionnées (choix) ou un fileId déjà uploadé (preuve
 * pratique), jamais un score ou un verdict.
 *
 * Si le quiz contient au moins une question PREUVE_PRATIQUE, la tentative
 * passe en EN_ATTENTE_VALIDATION : le score n'est déterminé qu'après revue
 * de toutes les preuves par le Seuil (voir reviewEvidence).
 */
export async function submitAttempt(
  userId: string,
  attemptId: string,
  input: SubmitAttemptInput,
) {
  const attempt = await repo.findAttemptById(attemptId);
  if (!attempt || attempt.userId !== userId) {
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      "Tentative introuvable.",
      undefined,
      "quiz.attemptNotFound",
    );
  }
  if (attempt.status !== "EN_COURS") {
    throw new AppError(
      "INVALID_STATE",
      "Cette tentative est déjà corrigée.",
      undefined,
      "quiz.alreadyCorrected",
    );
  }

  const questionsById = new Map(attempt.quiz.questions.map((q) => [q.id, q]));
  for (const submitted of input.answers) {
    if (!questionsById.has(submitted.questionId)) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Une réponse référence une question qui n'appartient pas à ce quiz.",
        undefined,
        "quiz.answerMismatch",
      );
    }
  }

  let autoScore = 0;
  const choiceAnswers: {
    questionId: string;
    selectedOptionIds: string[];
    isCorrect: boolean;
    points: number;
  }[] = [];
  const evidenceSubmissions: {
    questionId: string;
    userId: string;
    fileId: string;
  }[] = [];

  for (const question of attempt.quiz.questions) {
    const submitted = input.answers.find((a) => a.questionId === question.id);

    if (question.type === "PREUVE_PRATIQUE") {
      if (!submitted?.fileId) {
        throw new AppError(
          "VALIDATION_ERROR",
          "Un fichier preuve est requis pour cette question.",
          undefined,
          "quiz.evidenceRequired",
        );
      }
      const file = await repo.findFileById(submitted.fileId);
      if (!file || file.uploadedBy !== userId) {
        throw new AppError(
          "VALIDATION_ERROR",
          "Fichier preuve introuvable ou non uploadé par vous.",
          undefined,
          "quiz.evidenceFileInvalid",
        );
      }
      evidenceSubmissions.push({
        questionId: question.id,
        userId,
        fileId: submitted.fileId,
      });
      continue;
    }

    const selectedIds = submitted?.selectedOptionIds ?? [];
    const correctIds = new Set(
      question.options.filter((o) => o.isCorrect).map((o) => o.id),
    );
    const selectedSet = new Set(selectedIds);
    const isCorrect =
      correctIds.size === selectedSet.size &&
      [...correctIds].every((id) => selectedSet.has(id));
    const points = isCorrect ? question.points : 0;
    autoScore += points;

    choiceAnswers.push({
      questionId: question.id,
      selectedOptionIds: selectedIds,
      isCorrect,
      points,
    });
  }

  const hasEvidence = evidenceSubmissions.length > 0;
  const fullMaxScore = attempt.quiz.questions.reduce((s, q) => s + q.points, 0);

  let finalize: { totalScore: number; passed: boolean } | null = null;
  if (!hasEvidence) {
    const scorePercent =
      fullMaxScore > 0 ? Math.round((autoScore / fullMaxScore) * 100) : 0;
    finalize = { totalScore: scorePercent, passed: scorePercent >= attempt.quiz.passingScore };
  }

  const updated = await repo.recordSubmission(
    attemptId,
    choiceAnswers,
    evidenceSubmissions,
    finalize,
  );

  if (finalize?.passed && attempt.courseProgressId) {
    await applyPassedConsequences(
      userId,
      attempt.quiz.courseId,
      attempt.courseProgressId,
      finalize.totalScore,
      attemptId,
    );
  }

  return {
    attempt: updated,
    scorePercent: finalize?.totalScore ?? null,
    passed: finalize?.passed ?? null,
    pendingEvidence: hasEvidence,
  };
}

export function listPendingEvidence() {
  return repo.listPendingEvidenceForSeuil();
}

/**
 * Le Seuil approuve ou refuse une preuve pratique. Une fois toutes les
 * preuves d'une tentative revues, le score final est calculé (points
 * auto-corrigés + points des preuves approuvées) et la tentative finalisée
 * — jamais avant, pour ne pas valider un cours sur une correction partielle.
 */
export async function reviewEvidence(
  reviewerId: string,
  evidenceId: string,
  decision: "APPROUVE" | "REFUSE",
  comment: string | undefined,
) {
  const evidence = await repo.findEvidenceById(evidenceId);
  if (!evidence) {
    throw new AppError("RESOURCE_NOT_FOUND", "Preuve introuvable.");
  }
  if (evidence.status !== "SOUMISE") {
    throw new AppError("INVALID_STATE", "Cette preuve a déjà été revue.");
  }

  const approved = decision === "APPROUVE";
  await repo.recordEvidenceReview(evidenceId, reviewerId, decision, comment, approved);
  await recordAudit({
    actorType: "SEUIL",
    actorId: reviewerId,
    action: "EVIDENCE_REVIEWED",
    entityType: "PRACTICAL_EVIDENCE",
    entityId: evidenceId,
    oldValue: { status: "SOUMISE" },
    newValue: { status: approved ? "APPROUVEE" : "REFUSEE", comment },
    metadata: { userId: evidence.userId, attemptId: evidence.attemptId },
  });

  const pendingCount = await repo.findPendingEvidenceCount(evidence.attemptId);
  if (pendingCount > 0) {
    return { finalized: false };
  }

  // Toutes les preuves de la tentative sont revues : calcul du score final.
  const attempt = evidence.attempt;
  const answers = await repo.findAnswersForAttempt(evidence.attemptId);
  const allEvidence = await repo.findEvidenceForAttempt(evidence.attemptId);

  const autoScore = answers.reduce((s, a) => s + (a.points ?? 0), 0);
  const evidenceQuestionPoints = new Map(
    attempt.quiz.questions
      .filter((q) => q.type === "PREUVE_PRATIQUE")
      .map((q) => [q.id, q.points]),
  );
  const evidenceScore = allEvidence.reduce((s, e) => {
    if (e.status === "APPROUVEE") {
      return s + (evidenceQuestionPoints.get(e.questionId) ?? 0);
    }
    return s;
  }, 0);

  const maxScore = attempt.quiz.questions.reduce((s, q) => s + q.points, 0);
  const totalScore = autoScore + evidenceScore;
  const scorePercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const passed = scorePercent >= attempt.quiz.passingScore;

  const finalized = await repo.finalizeAttempt(evidence.attemptId, scorePercent, passed);

  await notify({
    userId: evidence.userId,
    type: "COURSE_VALIDATED",
    title: passed ? "Quiz corrigé — réussi" : "Quiz corrigé — non validé",
    message: `Votre preuve a été ${approved ? "approuvée" : "refusée"}. Score final : ${scorePercent}%.`,
  });

  if (passed && finalized.courseProgressId) {
    await applyPassedConsequences(
      evidence.userId,
      attempt.quiz.courseId,
      finalized.courseProgressId,
      scorePercent,
      evidence.attemptId,
    );
  }

  return { finalized: true, scorePercent, passed };
}
