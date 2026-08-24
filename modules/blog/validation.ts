import { z } from "zod";

// PROMPT MASTER BLOG §note : un article n'est jamais payant et ne débloque
// jamais de cours (séparation stricte blog / contenu pédagogique/commercial).
export const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(50000),
  excerpt: z.string().max(500).optional(),
  titleEn: z.string().max(200).optional(),
  contentEn: z.string().max(50000).optional(),
  excerptEn: z.string().max(500).optional(),
  language: z.enum(["fr", "en"]).default("fr"),
});
export type CreatePostInput = z.infer<typeof createPostSchema>;

export const updatePostSchema = createPostSchema.partial();
export type UpdatePostInput = z.infer<typeof updatePostSchema>;

export const postStatusSchema = z.object({
  status: z.enum(["BROUILLON", "PUBLIE", "RETIRE"]),
});
export type PostStatusInput = z.infer<typeof postStatusSchema>;

export const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});
export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const moderateCommentSchema = z.object({
  status: z.enum(["PUBLIE", "MASQUE", "SUPPRIME"]),
});
export type ModerateCommentInput = z.infer<typeof moderateCommentSchema>;
