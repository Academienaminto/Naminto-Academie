import type { ApiResult } from "@/lib/api/auth";

export async function enrollFormationRequest(
  formationId: string,
): Promise<ApiResult<unknown>> {
  const res = await fetch(`/api/v1/formations/${formationId}/enroll`, {
    method: "POST",
  });
  return res.json();
}
