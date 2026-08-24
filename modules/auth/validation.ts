import { z } from "zod";

// Longueur minimale de mot de passe : paramètre technique de sécurité,
// non fixé par les Règles Métier (contrairement au seuil de quiz, aux
// délais, etc., qui sont des règles métier et vivent dans l'entité Rule).
// 8 caractères est un plancher standard, ajustable sans impact fonctionnel.
const PASSWORD_MIN_LENGTH = 8;

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(PASSWORD_MIN_LENGTH),
  phone: z.string().min(6).max(32).optional(),
  language: z.enum(["fr", "en"]).default("fr"),
  firstName: z.string().min(1).max(120).optional(),
  lastName: z.string().min(1).max(120).optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const resendVerificationSchema = z.object({
  email: z.email(),
});
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
