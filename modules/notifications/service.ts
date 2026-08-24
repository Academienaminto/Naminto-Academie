import { AppError } from "@/lib/errors";
import * as repo from "@/modules/notifications/repository";

// PROMPT MASTER NOTIFICATIONS, ALERTES & ÉVÉNEMENTS : ÉVÉNEMENT →
// NOTIFICATION → DESTINATAIRE. Désactiver une préférence n'annule jamais
// l'événement métier sous-jacent (déjà enregistré via lib/events/record) —
// elle empêche seulement la création de la notification visible.
export async function notify(input: {
  userId: string;
  eventId?: string;
  type: string;
  title: string;
  message: string;
}) {
  const preference = await repo.getPreference(input.userId);
  if (preference && !preference.enabled) {
    return null;
  }
  return repo.createNotification(input);
}

export function listMine(userId: string) {
  return repo.listMyNotifications(userId);
}

export async function markRead(userId: string, notificationId: string) {
  const notification = await repo.findNotification(notificationId, userId);
  if (!notification) {
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      "Notification introuvable.",
      undefined,
      "notifications.notFound",
    );
  }
  return repo.markRead(notificationId);
}

export function getPreference(userId: string) {
  return repo.getPreference(userId);
}

export function updatePreference(
  userId: string,
  data: { enabled?: boolean; soundEnabled?: boolean },
) {
  return repo.upsertPreference(userId, data);
}
