import { z } from "zod";

// RÈGLES MÉTIER §63 : catalogue fermé des types de documents réglementaires
// — ne jamais en ajouter un qui ne soit pas dans cette liste (règle de
// non-invention, voir RÔLES ET PERMISSIONS §18).
export const DOCUMENT_TYPES = [
  "FAQ",
  "CONFIDENTIALITE",
  "STATUT",
  "REGLEMENT_INTERIEUR",
  "REGLES_PEDAGOGIQUES",
  "REGLES_DES_DELAIS",
  "REGLES_DES_SEANCES",
  "MISE_EN_GARDE",
] as const;

export const DOCUMENT_CATEGORIES = [
  "GENERALE",
  "CURSUS",
  "FORMATIONS",
  "COURS",
  "PAIEMENTS",
  "NON_APPLICABLE",
] as const;

export const createDocumentSchema = z.object({
  type: z.enum(DOCUMENT_TYPES),
  category: z.enum(DOCUMENT_CATEGORIES).default("NON_APPLICABLE"),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
});
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

export const documentStatusSchema = z.object({
  status: z.enum(["BROUILLON", "PUBLIE", "ARCHIVE"]),
});
export type DocumentStatusInput = z.infer<typeof documentStatusSchema>;

export const createVersionSchema = z.object({
  content: z.string().min(1).max(50000),
  language: z.enum(["fr", "en"]).default("fr"),
});
export type CreateVersionInput = z.infer<typeof createVersionSchema>;

export const versionStatusSchema = z.object({
  status: z.enum(["BROUILLON", "PUBLIE", "ARCHIVE"]),
});
export type VersionStatusInput = z.infer<typeof versionStatusSchema>;
