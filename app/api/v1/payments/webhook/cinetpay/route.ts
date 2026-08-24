import { NextResponse } from "next/server";
import { handlePaymentNotification } from "@/modules/payments/service";
import { getClientIp, isRateLimited } from "@/lib/security/rate-limit";

// Point d'entrée serveur-à-serveur, non authentifié par session (CinetPay
// n'a pas de cookie) : la sécurité vient de la revérification systématique
// du statut auprès de CinetPay dans handlePaymentNotification, jamais du
// contenu de cette requête (voir PROMPT MASTER PAIEMENTS §63).
//
// ⚠️ Nom de champ (cpm_trans_id) reconstitué de mémoire d'après le format
// historique des notifications CinetPay (form-urlencoded) — à confirmer
// avec la documentation réelle une fois les clés de production en main.
//
// Audit de sécurité du 23/08/2026 : cet endpoint n'a aucune authentification
// de la source (CinetPay ne signe pas ses webhooks par défaut) — une limite
// de débit large réduit le risque de sondage/épuisement des appels sortants
// vers l'API CinetPay sans jamais bloquer un trafic légitime normal.
export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (isRateLimited(`cinetpay-webhook:${ip}`, 60, 60_000)) {
    console.warn("[cinetpay-webhook] débit limité", ip);
    return NextResponse.json({ received: true });
  }

  let transactionId: string | null = null;

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await req.json()) as Record<string, unknown>;
    transactionId =
      (body.cpm_trans_id as string) ?? (body.transaction_id as string) ?? null;
  } else {
    const form = await req.formData();
    transactionId =
      (form.get("cpm_trans_id") as string) ??
      (form.get("transaction_id") as string) ??
      null;
  }

  if (!transactionId) {
    // Toujours répondre 200 : un webhook mal formé ne doit pas déclencher
    // de retentatives infinies côté prestataire pour un événement qu'on ne
    // saura de toute façon jamais interpréter.
    console.error("[cinetpay-webhook] transaction id manquant");
    return NextResponse.json({ received: true });
  }

  try {
    await handlePaymentNotification(transactionId);
  } catch (err) {
    console.error("[cinetpay-webhook-error]", err);
  }

  return NextResponse.json({ received: true });
}
