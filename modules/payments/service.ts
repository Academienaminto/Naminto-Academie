import { AppError } from "@/lib/errors";
import { recordEvent } from "@/lib/events/record";
import { notify } from "@/modules/notifications/service";
import * as repo from "@/modules/payments/repository";
import { getActiveProviderName, getPaymentProvider } from "@/modules/payments/provider";

// ARCHITECTURE GÉNÉRALE §6 : ACHAT → PAIEMENT → VÉRIFICATION →
// CONFIRMATION → DROIT D'ACCÈS. Le frontend ne déclare jamais lui-même
// "paiement confirmé" (PROMPT MASTER STACK TECHNIQUE §31) : seul ce
// service, après revérification auprès du prestataire, accorde l'accès.

function baseUrl() {
  return process.env.APP_URL ?? "http://localhost:3000";
}

export async function purchaseProduct(userId: string, productId: string) {
  const product = await repo.findProductById(productId);
  if (!product || product.status !== "ACTIF") {
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      "Produit introuvable.",
      undefined,
      "payments.productNotFound",
    );
  }

  const existingAccess = await repo.findActiveAccess(userId, productId);
  if (existingAccess) {
    throw new AppError(
      "CONFLICT",
      "Vous avez déjà accès à ce produit.",
      undefined,
      "payments.alreadyOwned",
    );
  }

  const order = await repo.createOrder(userId, product);
  const payment = await repo.createPayment({
    orderId: order.id,
    userId,
    method: "MONNAIE_ELECTRONIQUE",
    amount: Number(order.total.toString()),
    currency: order.currency,
  });
  await repo.setPaymentProviderReference(payment.id, payment.id);

  const providerName = getActiveProviderName();
  const provider = getPaymentProvider();
  let initiation;
  try {
    initiation = await provider.initiate({
      transactionId: payment.id,
      amount: Number(order.total.toString()),
      currency: order.currency,
      description: product.title,
      notifyUrl: `${baseUrl()}/api/v1/payments/webhook/${providerName}`,
      returnUrl: `${baseUrl()}/membre`,
      customerEmail: "", // renseigné par l'appelant si nécessaire
    });
  } catch (err) {
    console.error(`[${providerName}-initiate-failed]`, err);
    throw new AppError(
      "PAYMENT_FAILED",
      "Impossible d'initier le paiement pour le moment.",
      undefined,
      "payments.initiationFailed",
    );
  }

  return { orderId: order.id, paymentId: payment.id, paymentUrl: initiation.paymentUrl };
}

/**
 * Traite une notification de paiement. Revérifie systématiquement le
 * statut auprès du prestataire avant toute confirmation (jamais confiance
 * au corps du webhook). Idempotent : un même transactionId reçu deux fois
 * ne grante jamais l'accès deux fois (PROMPT MASTER BACKEND CORE §20).
 */
export async function handlePaymentNotification(transactionId: string) {
  const payment = await repo.findPaymentByProviderReference(transactionId);
  if (!payment) {
    throw new AppError("RESOURCE_NOT_FOUND", "Paiement introuvable.");
  }

  if (payment.status === "CONFIRME") {
    return payment; // idempotence : déjà traité, ne rien refaire.
  }

  const provider = getPaymentProvider();
  const verified = await provider.checkStatus(transactionId);

  await repo.recordPaymentEvent(
    payment.id,
    "STATUS_CHECK",
    verified.status,
    verified,
  );

  if (verified.status === "CONFIRME") {
    const confirmed = await repo.confirmPaymentAndGrantAccess(payment.id);

    const event = await recordEvent({
      type: "PAYMENT_CONFIRMED",
      userId: payment.userId,
      entityType: "PAYMENT",
      entityId: payment.id,
      payload: { orderId: payment.orderId, amount: payment.amount.toString() },
    });
    await notify({
      userId: payment.userId,
      eventId: event.id,
      type: "PAYMENT_CONFIRMED",
      title: "Paiement confirmé",
      message: "Votre paiement a été confirmé, votre accès est actif.",
    });

    return confirmed;
  }

  if (verified.status === "ECHOUE") {
    // Statut d'échec enregistré via PaymentEvent ci-dessus ; le paiement
    // initial reste EN_ATTENTE tant qu'aucune confirmation n'a eu lieu,
    // conformément à la règle "un paiement non confirmé ne crée jamais
    // d'accès".
    return payment;
  }

  return payment;
}
