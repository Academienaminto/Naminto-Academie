// Appels API centralisés pour le domaine paiements — mêmes conventions
// que lib/api/auth.ts. `purchaseRequest` initie l'achat côté serveur et
// renvoie l'URL de paiement vers laquelle rediriger le membre.
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
