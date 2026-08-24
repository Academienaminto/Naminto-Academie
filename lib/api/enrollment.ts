import type { ApiResult } from "@/lib/api/auth";

export async function enrollRequest(cursusId: string): Promise<ApiResult<unknown>> {
  const res = await fetch("/api/v1/enrollments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cursusId }),
  });
  return res.json();
}
