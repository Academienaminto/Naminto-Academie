import type { ApiResult } from "@/lib/api/auth";

export interface NotificationPreference {
  enabled: boolean;
  soundEnabled: boolean;
}

export async function updateNotificationPreferenceRequest(
  input: Partial<NotificationPreference>,
): Promise<ApiResult<NotificationPreference>> {
  const res = await fetch("/api/v1/notifications/preferences", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function markNotificationReadRequest(
  id: string,
): Promise<ApiResult<unknown>> {
  const res = await fetch(`/api/v1/notifications/${id}/read`, {
    method: "PATCH",
  });
  return res.json();
}
