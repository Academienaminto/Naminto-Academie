import { z } from "zod";

// Schéma Zod du corps de requête d'inscription à un cursus (étape
// INSCRIPTION, voir modules/enrollment/service.ts#enroll).
export const enrollSchema = z.object({
  cursusId: z.string().min(1),
});
export type EnrollInput = z.infer<typeof enrollSchema>;
