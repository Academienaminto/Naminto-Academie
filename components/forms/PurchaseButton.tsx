"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { purchaseRequest } from "@/lib/api/payments";

/** Initie un achat (cours, formation ou livre payant — le produit
 * commercial est générique, PROMPT MASTER PAIEMENTS) puis redirige vers la
 * page de paiement CinetPay renvoyée par le serveur. */
export function PurchaseButton({
  productId,
  label = "Acheter",
}: {
  productId: string;
  label?: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setPending(true);
    setError(null);
    const result = await purchaseRequest(productId);
    setPending(false);

    if (!result.success) {
      setError(result.error.message);
      return;
    }
    window.location.href = result.data.paymentUrl;
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button onClick={onClick} disabled={pending} variant="secondary">
        {pending ? "…" : label}
      </Button>
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
