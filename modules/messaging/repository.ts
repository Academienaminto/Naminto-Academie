import { db } from "@/lib/db";

export function createConversation(
  userId: string,
  contextType: string,
  contextId: string | undefined,
  firstMessage: string,
) {
  return db.conversation.create({
    data: {
      userId,
      type: "SUPPORT",
      contextType,
      contextId,
      status: "OUVERTE",
      messages: {
        create: { senderId: userId, content: firstMessage, status: "ENVOYE" },
      },
    },
    include: { messages: true },
  });
}

export function findConversationById(id: string) {
  return db.conversation.findUnique({
    where: { id },
    include: { messages: { orderBy: { sentAt: "asc" } } },
  });
}

export function updateConversationStatus(id: string, status: string) {
  return db.conversation.update({
    where: { id },
    data: { status, closedAt: status === "FERMEE" ? new Date() : null },
  });
}

export function listMyConversations(userId: string) {
  return db.conversation.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { messages: { orderBy: { sentAt: "desc" }, take: 1 } },
  });
}

export function listAllConversations() {
  return db.conversation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { include: { profile: true } },
      messages: { orderBy: { sentAt: "desc" }, take: 1 },
    },
  });
}

export function addMessage(conversationId: string, senderId: string, content: string) {
  return db.message.create({
    data: { conversationId, senderId, content, status: "ENVOYE" },
  });
}
