import { z } from "zod";

// ARCHITECTURE GÉNÉRALE §12, §93 : structure fixe 9 niveaux × 6 cours.
export const LEVEL_COUNT = 9;
export const COURSES_PER_LEVEL = 6;

export const createCursusSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  titleEn: z.string().max(200).optional(),
  descriptionEn: z.string().max(5000).optional(),
  language: z.enum(["fr", "en"]).default("fr"),
});
export type CreateCursusInput = z.infer<typeof createCursusSchema>;

export const updateCursusSchema = createCursusSchema.partial().extend({
  status: z.enum(["BROUILLON", "PUBLIE", "DEPUBLIE", "ARCHIVE"]).optional(),
});
export type UpdateCursusInput = z.infer<typeof updateCursusSchema>;

export const createLevelSchema = z.object({
  number: z.int().min(1).max(LEVEL_COUNT),
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  nameEn: z.string().max(200).optional(),
  descriptionEn: z.string().max(5000).optional(),
});
export type CreateLevelInput = z.infer<typeof createLevelSchema>;

export const createCourseSchema = z.object({
  levelId: z.string().min(1),
  position: z.int().min(1).max(COURSES_PER_LEVEL),
  title: z.string().min(1).max(200),
  description: z.string().max(10000).optional(),
  titleEn: z.string().max(200).optional(),
  descriptionEn: z.string().max(10000).optional(),
  price: z.number().nonnegative().optional(),
  currency: z.string().length(3).default("XOF"),
  duration: z.int().nonnegative().optional(),
});
export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export const publishSchema = z.object({
  status: z.enum(["BROUILLON", "PUBLIE", "DEPUBLIE", "ARCHIVE"]),
});
export type PublishInput = z.infer<typeof publishSchema>;

export const addCourseVersionSchema = z.object({
  fileId: z.string().min(1),
});
export type AddCourseVersionInput = z.infer<typeof addCourseVersionSchema>;
