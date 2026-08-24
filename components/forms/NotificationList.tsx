"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markNotificationReadRequest } from "@/lib/api/notifications";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  status: string;
}

export function NotificationList({
  notifications,
  t,
}: {
  notifications: NotificationItem[];
  t: Dictionary["membrePage"];
}) {
  const router = useRouter();
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);

  const unreadCount = notifications.filter(
    (n) => n.status === "NON_LUE" && !readIds.has(n.id),
  ).length;

  async function onMarkRead(id: string) {
    setPendingId(id);
    const result = await markNotificationReadRequest(id);
    setPendingId(null);
    if (!result.success) return;
    setReadIds((prev) => new Set(prev).add(id));
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-wide text-text-muted">
        {t.notifications}
        {unreadCount > 0 ? ` (${unreadCount} ${t.unread})` : ""}
      </p>
      <ul className="flex flex-col gap-2">
        {notifications.slice(0, 5).map((n) => {
          const isUnread = n.status === "NON_LUE" && !readIds.has(n.id);
          return (
            <li
              key={n.id}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className={isUnread ? "text-text" : "text-text-muted"}>
                {n.title} — {n.message}
              </span>
              {isUnread && (
                <button
                  type="button"
                  onClick={() => onMarkRead(n.id)}
                  disabled={pendingId === n.id}
                  className="shrink-0 text-xs text-accent hover:underline disabled:opacity-50"
                >
                  {t.markAsRead}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
