import { z } from "zod";

// Schémas Zod validant toutes les entrées utilisateur du module auth
// (inscription, connexion, vérification d'email, réinitialisation de mot
// de passe) avant qu'elles n'atteignent modules/auth/service.ts. Liste
// blanche par construction : un champ absent d'un schéma ne peut pas
// traverser cette frontière, donc toute donnée acceptée par service.ts
// provient forcément d'un de ces schémas.

// Longueur minimale de mot de passe : paramètre technique de sécurité,
// non fixé par les Règles Métier (contrairement au seuil de quiz, aux
// délais, etc., qui sont des règles métier et vivent dans l'entité Rule).
// 8 caractères est un plancher standard, ajustable sans impact fonctionnel.
export const PASSWORD_MIN_LENGTH = 8;

// Email en base non sensible à la casse (pas de citext, colonne @unique
// standard) : on normalise systématiquement en minuscules à cette frontière
// de validation, seul point de passage commun à tous les flux (inscription,
// connexion, mot de passe oublié, renvoi de vérification). Sans ça, un
// compte banni pouvait se réinscrire avec une variante de casse du même
// email et obtenir un nouveau compte actif, contournant le bannissement.
const emailSchema = z.string().trim().toLowerCase().pipe(z.email());

export const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(PASSWORD_MIN_LENGTH),
  phone: z.string().min(6).max(32).optional(),
  language: z.enum(["fr", "en"]).default("fr"),
  firstName: z.string().min(1).max(120).optional(),
  lastName: z.string().min(1).max(120).optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const resendVerificationSchema = z.object({
  email: emailSchema,
});
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

export const requestPasswordResetSchema = z.object({
  email: emailSchema,
});
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(PASSWORD_MIN_LENGTH),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
