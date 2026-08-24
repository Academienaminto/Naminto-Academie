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

// ÉTATS DES ENTITÉS §32 : OUVERTE → ACTIVE → FERMÉE. Une conversation
// fermée reste conservée (jamais supprimée) selon les règles d'historique.
export const CONVERSATION_STATUSES = ["OUVERTE", "ACTIVE", "FERMEE"] as const;

export const updateConversationStatusSchema = z.object({
  status: z.enum(CONVERSATION_STATUSES),
});
export type UpdateConversationStatusInput = z.infer<typeof updateConversationStatusSchema>;
