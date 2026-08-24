// Appels API centralisés pour l'inscription à un cursus — mêmes
// conventions que lib/api/auth.ts. Voir lib/api/formations.ts pour
// l'inscription à une formation (parcours distinct côté API).
import type { ApiResult } from "@/lib/api/auth";

export async function enrollRequest(cursusId: string): Promise<ApiResult<unknown>> {
  const res = await fetch("/api/v1/enrollments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cursusId }),
  });
  return res.json();
}
