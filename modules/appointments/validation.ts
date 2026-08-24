import { z } from "zod";

// RÈGLES MÉTIER — valeurs par défaut (23/08/2026) : fuseau horaire officiel
// Africa/Abidjan (UTC+0, sans heure d'été — donc identique à un horodatage
// UTC stocké tel quel, aucune conversion nécessaire côté serveur) ; durée
// par défaut d'un rendez-vous 30 minutes.
//
// PROMPT MASTER RENDEZ-VOUS §note : pas de logique de disponibilités
// automatique tant qu'elle n'est pas définie officiellement — le membre
// propose une date, le Seuil confirme ou reporte manuellement.

export const proposeAppointmentSchema = z.object({
  proposedAt: z.iso.datetime(),
  learningSessionId: z.string().optional(),
});
export type ProposeAppointmentInput = z.infer<typeof proposeAppointmentSchema>;

export const scheduleSchema = z.object({
  scheduledAt: z.iso.datetime(),
});
export type ScheduleInput = z.infer<typeof scheduleSchema>;
