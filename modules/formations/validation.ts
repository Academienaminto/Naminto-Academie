import { z } from "zod";

// RÈGLES MÉTIER §18 : une formation est indépendante du cursus initiatique
// et porte elle-même le prix — ses parties et cours n'en portent jamais
// (contrairement aux cours du cursus, qui peuvent être individuellement
// gratuits ou payants).
export const createFormationSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  titleEn: z.string().max(200).optional(),
  descriptionEn: z.string().max(5000).optional(),
  price: z.number().nonnegative().optional(),
  currency: z.string().length(3).default("XOF"),
  language: z.enum(["fr", "en"]).default("fr"),
});
export type CreateFormationInput = z.infer<typeof createFormationSchema>;

export const createFormationPartSchema = z.object({
  position: z.int().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  titleEn: z.string().max(200).optional(),
  descriptionEn: z.string().max(5000).optional(),
});
export type CreateFormationPartInput = z.infer<typeof createFormationPartSchema>;

export const createFormationCourseSchema = z.object({
  formationPartId: z.string().min(1),
  position: z.int().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(10000).optional(),
  titleEn: z.string().max(200).optional(),
  descriptionEn: z.string().max(10000).optional(),
  duration: z.int().nonnegative().optional(),
});
export type CreateFormationCourseInput = z.infer<typeof createFormationCourseSchema>;
