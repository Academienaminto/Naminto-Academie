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

  // Empêche un double achat du même produit (pas de contrôle possible côté
  // frontend puisque userId vient de la session serveur, pas d'un paramètre
  // de la requête).
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
  // Référence prestataire = payment.id dès la création : c'est aussi
  // l'identifiant transmis comme transactionId à initiate() ci-dessous, et
  // les deux implémentations de PaymentProvider renvoient ce même
  // transactionId comme providerReference — donc initiation.providerReference
  // (plus bas) n'a pas besoin d'être réécrit en base, il est déjà correct.
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
  // Revérification obligatoire auprès du prestataire : le webhook peut être
  // appelé par n'importe qui (le corps de la requête n'est pas fiable), donc
  // seul ce statut relu directement chez CinetPay/Adullam fait foi — voir
  // PaymentProvider.checkStatus dans provider.ts.
  const verified = await provider.checkStatus(transactionId);

  await repo.recordPaymentEvent(
    payment.id,
    "STATUS_CHECK",
    verified.status,
    verified,
  );

  if (verified.status === "CONFIRME") {
    // Un statut CONFIRME ne suffit pas : on revérifie que le montant/devise
    // renvoyés par le prestataire correspondent à ce qui a été commandé.
    // Sans ce contrôle, un paiement confirmé pour un montant réduit (ou
    // falsifié) accorderait quand même l'accès complet au produit.
    const expectedAmount = Number(payment.amount.toString());
    const amountMatches = Math.abs(verified.amount - expectedAmount) < 0.01;
    const currencyMatches = verified.currency === payment.currency;

    if (!amountMatches || !currencyMatches) {
      console.error(
        `[payment-amount-mismatch] payment=${payment.id} expected=${expectedAmount}${payment.currency} verified=${verified.amount}${verified.currency}`,
      );
      await repo.recordPaymentEvent(payment.id, "AMOUNT_MISMATCH", verified.status, verified);
      return repo.markPaymentFailed(payment.id);
    }

    const confirmed = await repo.confirmPaymentAndGrantAccess(payment.id);

    // recordEvent/notify volontairement en dehors de la transaction DB
    // ci-dessus : l'accès est déjà accordé et commité à ce stade, donc un
    // échec de notification (service externe, etc.) ne doit ni annuler
    // l'accès déjà accordé, ni bloquer la réponse au webhook.
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
    // Statut d'échec enregistré via PaymentEvent ci-dessus, et persisté sur
    // Payment/Order eux-mêmes (sinon ils restaient bloqués indéfiniment sur
    // INITIE/CREEE malgré un échec confirmé par le prestataire).
    return repo.markPaymentFailed(payment.id);
  }

  return payment;
}
