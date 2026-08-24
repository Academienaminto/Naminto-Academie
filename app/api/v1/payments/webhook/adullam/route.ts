import { NextResponse } from "next/server";
import { handlePaymentNotification } from "@/modules/payments/service";
import { getClientIp, isRateLimited } from "@/lib/security/rate-limit";

// Miroir de app/api/v1/payments/webhook/cinetpay/route.ts — Adullam
// suivrait le même format (confirmé par l'utilisateur le 23/08/2026), donc
// la même structure de notification (champ transaction_id) est supposée
// ici jusqu'à vérification contre une documentation réelle, qui n'existe
// dans aucun document du projet. La sécurité vient, comme pour CinetPay,
// de la revérification systématique du statut auprès du prestataire dans
// handlePaymentNotification — jamais du contenu de cette requête.
export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (isRateLimited(`adullam-webhook:${ip}`, 60, 60_000)) {
    console.warn("[adullam-webhook] débit limité", ip);
    return NextResponse.json({ received: true });
  }

  let transactionId: string | null = null;

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await req.json()) as Record<string, unknown>;
    transactionId = (body.transaction_id as string) ?? null;
  } else {
    const form = await req.formData();
    transactionId = (form.get("transaction_id") as string) ?? null;
  }

  if (!transactionId) {
    console.error("[adullam-webhook] transaction id manquant");
    return NextResponse.json({ received: true });
  }

  try {
    await handlePaymentNotification(transactionId);
  } catch (err) {
    console.error("[adullam-webhook-error]", err);
  }

  return NextResponse.json({ received: true });
}
