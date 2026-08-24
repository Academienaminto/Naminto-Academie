"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PurchaseButton } from "@/components/forms/PurchaseButton";
import type { ApiResult } from "@/lib/api/auth";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** Le statut d'accès (gratuit vs déjà acheté) n'est jamais connu côté
 * client à l'avance : on tente le téléchargement, et le serveur répond
 * PAYMENT_REQUIRED si un achat est nécessaire (jamais l'inverse — pas de
 * bouton "Acheter" déduit d'un état frontend, PROMPT MASTER PAIEMENTS). */
export function BookDownloadButton({
  bookId,
  productId,
  t,
}: {
  bookId: string;
  productId?: string;
  t: Dictionary["bibliothequePage"];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [needsPurchase, setNeedsPurchase] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setPending(true);
    setError(null);
    const res = await fetch(`/api/v1/books/${bookId}/download`);
    const result: ApiResult<{ url: string }> = await res.json();
    setPending(false);

    if (!result.success) {
      if (result.error.code === "AUTH_REQUIRED") {
        router.push("/connexion");
        return;
      }
      if (result.error.code === "PAYMENT_REQUIRED") {
        setNeedsPurchase(true);
        return;
      }
      setError(result.error.message);
      return;
    }
    window.open(result.data.url, "_blank", "noopener,noreferrer");
  }

  if (needsPurchase && productId) {
    return <PurchaseButton productId={productId} label={t.buyToDownload} />;
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button onClick={onClick} disabled={pending}>
        {pending ? t.downloading : t.download}
      </Button>
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
