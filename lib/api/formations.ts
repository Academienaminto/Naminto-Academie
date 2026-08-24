// Appels API centralisés pour l'inscription à une formation — mêmes
// conventions que lib/api/auth.ts. Voir lib/api/enrollment.ts pour
// l'inscription à un cursus (endpoint distinct côté API).
import type { ApiResult } from "@/lib/api/auth";

export async function enrollFormationRequest(
  formationId: string,
): Promise<ApiResult<unknown>> {
  const res = await fetch(`/api/v1/formations/${formationId}/enroll`, {
    method: "POST",
  });
  return res.json();
}
