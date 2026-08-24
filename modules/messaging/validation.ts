import { z } from "zod";

// PROMPT MASTER MESSAGERIE & COMMUNICATION : 4 canaux distincts (interne,
// WhatsApp, email, contact général). Ce module ne couvre que la
// messagerie interne — les autres canaux restent hors périmètre ici.
export const CONTEXT_TYPES = ["GENERAL", "COURS", "FORMATION", "CURSUS"] as const;

export const startConversationSchema = z.object({
  contextType: z.enum(CONTEXT_TYPES).default("GENERAL"),
  contextId: z.string().optional(),
  message: z.string().min(1).max(5000),
});
export type StartConversationInput = z.infer<typeof startConversationSchema>;

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
