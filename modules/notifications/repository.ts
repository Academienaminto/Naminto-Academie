import { db } from "@/lib/db";

export function getPreference(userId: string) {
  return db.notificationPreference.findUnique({ where: { userId } });
}

export function createNotification(input: {
  userId: string;
  eventId?: string;
  type: string;
  title: string;
  message: string;
}) {
  return db.notification.create({
    data: {
      userId: input.userId,
      eventId: input.eventId,
      type: input.type,
      title: input.title,
      message: input.message,
      status: "NON_LUE",
      sentAt: new Date(),
    },
  });
}

export function listMyNotifications(userId: string) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export function findNotification(id: string, userId: string) {
  return db.notification.findFirst({ where: { id, userId } });
}

export function markRead(id: string) {
  return db.notification.update({
    where: { id },
    data: { status: "LUE", readAt: new Date() },
  });
}

export function upsertPreference(
  userId: string,
  data: { enabled?: boolean; soundEnabled?: boolean },
) {
  return db.notificationPreference.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      enabled: data.enabled ?? true,
      soundEnabled: data.soundEnabled ?? true,
    },
  });
}
