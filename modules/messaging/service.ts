import { AppError } from "@/lib/errors";
import { notify } from "@/modules/notifications/service";
import * as repo from "@/modules/messaging/repository";
import type { StartConversationInput } from "@/modules/messaging/validation";

// PROMPT MASTER STACK TECHNIQUE §35 MESSAGERIE : un utilisateur ne doit
// jamais pouvoir récupérer les messages d'un autre utilisateur (anti-IDOR).
// Le Seuil (MANAGE_MESSAGES) peut accéder à toutes les conversations ;
// un membre uniquement aux siennes — la distinction est faite ici, pas
// dans les routes, pour ne pas dupliquer la règle.

export function startConversation(userId: string, input: StartConversationInput) {
  return repo.createConversation(
    userId,
    input.contextType,
    input.contextId,
    input.message,
  );
}

export function listMine(userId: string) {
  return repo.listMyConversations(userId);
}

export function listAll() {
  return repo.listAllConversations();
}

async function loadConversationForUser(
  conversationId: string,
  userId: string,
  canManageAll: boolean,
) {
  const conversation = await repo.findConversationById(conversationId);
  if (!conversation) {
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      "Conversation introuvable.",
      undefined,
      "messaging.notFound",
    );
  }
  if (!canManageAll && conversation.userId !== userId) {
    throw new AppError(
      "FORBIDDEN",
      "Cette conversation ne vous appartient pas.",
      undefined,
      "messaging.forbidden",
    );
  }
  return conversation;
}

export async function getConversation(
  conversationId: string,
  userId: string,
  canManageAll: boolean,
) {
  return loadConversationForUser(conversationId, userId, canManageAll);
}

export async function reply(
  conversationId: string,
  senderId: string,
  content: string,
  canManageAll: boolean,
) {
  const conversation = await loadConversationForUser(
    conversationId,
    senderId,
    canManageAll,
  );

  const message = await repo.addMessage(conversationId, senderId, content);

  // Le Seuil répond à un membre : on notifie le membre. L'inverse (membre
  // écrit au Seuil) n'a pas de destinataire individuel unique à notifier
  // ici — voir Espace du Seuil pour la vue d'ensemble des conversations.
  if (senderId !== conversation.userId) {
    await notify({
      userId: conversation.userId,
      type: "MESSAGE_RECEIVED",
      title: "Nouveau message",
      message: "Le Seuil vous a répondu.",
    });
  }

  return message;
}
