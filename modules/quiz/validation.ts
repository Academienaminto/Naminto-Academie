import { z } from "zod";

export const createQuizSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  titleEn: z.string().max(200).optional(),
  descriptionEn: z.string().max(2000).optional(),
  passingScore: z.int().min(1).max(100).default(70),
});
export type CreateQuizInput = z.infer<typeof createQuizSchema>;

// CHOIX_UNIQUE / CHOIX_MULTIPLE : corrigées automatiquement à la
// soumission. PREUVE_PRATIQUE : nécessite une preuve (photo/vidéo)
// uploadée via le module Stockage, revue manuellement par le Seuil avant
// que la tentative ne soit finalisée (PROMPT MASTER PROGRESSION
// PÉDAGOGIQUE, EvidenceReview).
export const QUESTION_TYPES = [
  "CHOIX_UNIQUE",
  "CHOIX_MULTIPLE",
  "PREUVE_PRATIQUE",
] as const;

export const createQuestionSchema = z
  .object({
    question: z.string().min(1).max(2000),
    questionEn: z.string().max(2000).optional(),
    type: z.enum(QUESTION_TYPES),
    position: z.int().min(1),
    points: z.int().min(1).max(100).default(1),
    options: z
      .array(
        z.object({
          label: z.string().min(1).max(500),
          labelEn: z.string().max(500).optional(),
          isCorrect: z.boolean(),
        }),
      )
      .default([]),
  })
  .refine(
    (data) => data.type === "PREUVE_PRATIQUE" || data.options.length >= 2,
    { message: "Au moins deux options sont requises pour un choix.", path: ["options"] },
  )
  .refine(
    (data) => data.type === "PREUVE_PRATIQUE" || data.options.some((o) => o.isCorrect),
    { message: "Au moins une réponse correcte est requise.", path: ["options"] },
  )
  .refine(
    (data) =>
      data.type !== "CHOIX_UNIQUE" ||
      data.options.filter((o) => o.isCorrect).length === 1,
    {
      message: "Un choix unique doit avoir exactement une réponse correcte.",
      path: ["options"],
    },
  );
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;

export const submitAttemptSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        selectedOptionIds: z.array(z.string().min(1)).optional(),
        fileId: z.string().min(1).optional(),
      }),
    )
    .min(1),
});
export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;

export const reviewEvidenceSchema = z.object({
  decision: z.enum(["APPROUVE", "REFUSE"]),
  comment: z.string().max(2000).optional(),
});
export type ReviewEvidenceInput = z.infer<typeof reviewEvidenceSchema>;
