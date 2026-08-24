// Appels API centralisés pour le domaine rendez-vous (proposition d'un
// créneau par le membre) — mêmes conventions que lib/api/auth.ts.
import type { ApiResult } from "@/lib/api/auth";

export async function proposeAppointmentRequest(input: {
  proposedAt: string;
  learningSessionId?: string;
}): Promise<ApiResult<unknown>> {
  const res = await fetch("/api/v1/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return res.json();
}
