import { db } from "@/lib/db";
import type { CreateQuestionInput, CreateQuizInput } from "@/modules/quiz/validation";

export function findCourseById(courseId: string) {
  return db.course.findUnique({ where: { id: courseId } });
}

export function findQuizByCourseId(courseId: string) {
  return db.quiz.findUnique({ where: { courseId } });
}

/** Vue Seuil : inclut isCorrect, contrairement à findQuizForAttempt. */
export function findQuizByCourseIdWithQuestions(courseId: string) {
  return db.quiz.findUnique({
    where: { courseId },
    include: { questions: { orderBy: { position: "asc" }, include: { options: true } } },
  });
}

export function createQuiz(courseId: string, input: CreateQuizInput) {
  return db.quiz.create({
    data: { courseId, ...input, status: "BROUILLON" },
  });
}

export function updateQuizStatus(id: string, status: string) {
  return db.quiz.update({ where: { id }, data: { status } });
}

export function findQuizById(id: string) {
  return db.quiz.findUnique({
    where: { id },
    include: { questions: { orderBy: { position: "asc" }, include: { options: true } } },
  });
}

/** Vue apprenant : jamais isCorrect (§9 RÈGLES DU QUIZ — les réponses
 * correctes ne doivent pas être exposées avant correction). */
export function findQuizForAttempt(id: string) {
  return db.quiz.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          question: true,
          questionEn: true,
          type: true,
          position: true,
          points: true,
          options: {
            select: { id: true, label: true, labelEn: true, position: true },
          },
        },
      },
    },
  });
}

export function findMyAttempts(userId: string, quizId: string) {
  return db.quizAttempt.findMany({
    where: { userId, quizId },
    orderBy: { attemptNumber: "asc" },
    select: {
      id: true,
      attemptNumber: true,
      status: true,
      score: true,
      submittedAt: true,
    },
  });
}

export function findQuestionByPosition(quizId: string, position: number) {
  return db.quizQuestion.findFirst({ where: { quizId, position } });
}

export function createQuestion(quizId: string, input: CreateQuestionInput) {
  return db.quizQuestion.create({
    data: {
      quizId,
      question: input.question,
      questionEn: input.questionEn,
      type: input.type,
      position: input.position,
      points: input.points,
      requiresEvidence: input.type === "PREUVE_PRATIQUE",
      options: {
        create: input.options.map((option, index) => ({
          ...option,
          position: index + 1,
        })),
      },
    },
    include: { options: true },
  });
}

export function countAttempts(userId: string, quizId: string) {
  return db.quizAttempt.count({ where: { userId, quizId } });
}

export function findPassedAttempt(userId: string, quizId: string) {
  return db.quizAttempt.findFirst({
    where: { userId, quizId, status: "REUSSI" },
  });
}

export function findCourseProgress(userId: string, courseId: string) {
  return db.courseProgress.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
}

export function createAttempt(
  userId: string,
  quizId: string,
  courseProgressId: string | undefined,
  attemptNumber: number,
) {
  return db.quizAttempt.create({
    data: {
      userId,
      quizId,
      courseProgressId,
      attemptNumber,
      status: "EN_COURS",
    },
  });
}

export function findAttemptById(id: string) {
  return db.quizAttempt.findUnique({
    where: { id },
    include: { quiz: { include: { questions: { include: { options: true } } } } },
  });
}

export function findFileById(id: string) {
  return db.file.findUnique({ where: { id } });
}

/**
 * Enregistre les réponses à choix (corrigées) et, séparément, une preuve
 * pratique par question qui en requiert une. Si au moins une preuve est en
 * attente, la tentative passe en EN_ATTENTE_VALIDATION (score encore
 * indéterminé) plutôt que REUSSI/ECHOUE — voir finalizeAttempt.
 */
export async function recordSubmission(
  attemptId: string,
  choiceAnswers: {
    questionId: string;
    selectedOptionIds: string[];
    isCorrect: boolean;
    points: number;
  }[],
  evidenceSubmissions: { questionId: string; userId: string; fileId: string }[],
  finalize: { totalScore: number; passed: boolean } | null,
) {
  return db.$transaction(async (tx) => {
    for (const answer of choiceAnswers) {
      await tx.quizAnswer.create({
        data: {
          attemptId,
          questionId: answer.questionId,
          answer: answer.selectedOptionIds,
          isCorrect: answer.isCorrect,
          points: answer.points,
        },
      });
    }

    for (const evidence of evidenceSubmissions) {
      const created = await tx.practicalEvidence.create({
        data: {
          attemptId,
          questionId: evidence.questionId,
          userId: evidence.userId,
          status: "SOUMISE",
        },
      });
      await tx.evidenceFile.create({
        data: { evidenceId: created.id, fileId: evidence.fileId },
      });
    }

    return tx.quizAttempt.update({
      where: { id: attemptId },
      data: finalize
        ? {
            status: finalize.passed ? "REUSSI" : "ECHOUE",
            score: finalize.totalScore,
            submittedAt: new Date(),
            correctedAt: new Date(),
          }
        : { status: "EN_ATTENTE_VALIDATION", submittedAt: new Date() },
    });
  });
}

export function findEvidenceById(id: string) {
  return db.practicalEvidence.findUnique({
    where: { id },
    include: {
      attempt: { include: { quiz: { include: { questions: true } } } },
      question: true,
    },
  });
}

export function findPendingEvidenceCount(attemptId: string) {
  return db.practicalEvidence.count({
    where: { attemptId, status: "SOUMISE" },
  });
}

export function findEvidenceForAttempt(attemptId: string) {
  return db.practicalEvidence.findMany({ where: { attemptId } });
}

export function findAnswersForAttempt(attemptId: string) {
  return db.quizAnswer.findMany({ where: { attemptId } });
}

export async function recordEvidenceReview(
  evidenceId: string,
  reviewerId: string,
  decision: string,
  comment: string | undefined,
  approved: boolean,
) {
  return db.$transaction(async (tx) => {
    await tx.evidenceReview.create({
      data: { evidenceId, reviewerId, decision, comment },
    });
    return tx.practicalEvidence.update({
      where: { id: evidenceId },
      data: {
        status: approved ? "APPROUVEE" : "REFUSEE",
        reviewedAt: new Date(),
        validatedAt: approved ? new Date() : undefined,
      },
    });
  });
}

export function finalizeAttempt(
  attemptId: string,
  totalScore: number,
  passed: boolean,
) {
  return db.quizAttempt.update({
    where: { id: attemptId },
    data: {
      status: passed ? "REUSSI" : "ECHOUE",
      score: totalScore,
      correctedAt: new Date(),
    },
  });
}

export function listPendingEvidenceForSeuil() {
  return db.practicalEvidence.findMany({
    where: { status: "SOUMISE" },
    orderBy: { submittedAt: "asc" },
    include: {
      question: true,
      user: { include: { profile: true } },
      files: { include: { file: true } },
    },
  });
}
