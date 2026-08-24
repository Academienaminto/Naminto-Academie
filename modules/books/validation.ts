import { z } from "zod";

// RÈGLES MÉTIER §39-41 : un livre gratuit ne nécessite jamais d'achat ;
// un livre payant doit avoir un prix. L'achat d'un livre est indépendant
// du cursus et des formations — aucun quiz ni progression pédagogique.
export const createBookSchema = z
  .object({
    title: z.string().min(1).max(200),
    description: z.string().max(5000).optional(),
    titleEn: z.string().max(200).optional(),
    descriptionEn: z.string().max(5000).optional(),
    author: z.string().max(200).optional(),
    isFree: z.boolean().default(false),
    price: z.number().nonnegative().optional(),
    currency: z.string().length(3).default("XOF"),
    language: z.enum(["fr", "en"]).default("fr"),
  })
  .refine((data) => data.isFree || (data.price !== undefined && data.price > 0), {
    message: "Un livre payant doit avoir un prix supérieur à 0.",
    path: ["price"],
  });
export type CreateBookInput = z.infer<typeof createBookSchema>;

export const addBookVersionSchema = z.object({
  fileId: z.string().min(1),
});
export type AddBookVersionInput = z.infer<typeof addBookVersionSchema>;
