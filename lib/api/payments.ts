import type { ApiResult } from "@/lib/api/auth";

interface PurchaseResult {
  orderId: string;
  paymentId: string;
  paymentUrl: string;
}

export async function purchaseRequest(
  productId: string,
): Promise<ApiResult<PurchaseResult>> {
  const res = await fetch("/api/v1/payments/purchase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  });
  return res.json();
}
