import type { Product } from "@prisma/client";
import { db } from "@/lib/db";

// Couche d'accès aux données du module Paiements : Product, Order,
// Payment, PaymentEvent et Access. Consommée uniquement par
// modules/payments/service.ts, qui porte les règles métier (jamais de
// vérification de droit ici, seulement de la persistance).
//
// Order / Payment / Access sont volontairement 3 entités distinctes plutôt
// qu'une seule table : Order fige ce qui a été commandé et à quel prix
// (§24, indépendant du prix courant du produit) ; Payment trace la
// tentative de règlement effective avec le prestataire (peut échouer,
// être retentée) ; Access est le seul et unique élément que le reste de
// l'app doit consulter pour savoir « cet utilisateur a-t-il le droit
// d'utiliser ce produit ? », sans avoir à connaître l'historique des
// commandes/paiements qui y ont mené.
//
// Invariant critique : confirmPaymentAndGrantAccess ci-dessous est le SEUL
// endroit du code qui doit faire passer un Access à ACTIF pour un achat.
// Ne pas dupliquer cette logique ailleurs.

export function findProductById(id: string) {
  return db.product.findUnique({ where: { id } });
}

export function findActiveAccess(userId: string, productId: string) {
  return db.access.findFirst({ where: { userId, productId, status: "ACTIF" } });
}

/** Commande + ligne de commande dans une seule transaction (§24 : le prix
 * de l'achat est figé au moment de la commande, indépendamment du prix
 * courant du produit). */
export function createOrder(userId: string, product: Product) {
  const amount = product.price ? Number(product.price.toString()) : 0;
  const currency = product.currency ?? "XOF";

  return db.order.create({
    data: {
      userId,
      status: "CREEE",
      subtotal: amount,
      total: amount,
      currency,
      items: {
        create: {
          productId: product.id,
          quantity: 1,
          unitPrice: amount,
          totalPrice: amount,
        },
      },
    },
    include: { items: true },
  });
}

export function findOrderById(id: string) {
  return db.order.findUnique({ where: { id }, include: { items: true } });
}

export function createPayment(input: {
  orderId: string;
  userId: string;
  method: "MONNAIE_ELECTRONIQUE" | "CARTE";
  amount: number;
  currency: string;
}) {
  return db.payment.create({
    data: {
      orderId: input.orderId,
      userId: input.userId,
      method: input.method,
      amount: input.amount,
      currency: input.currency,
      status: "INITIE",
    },
  });
}

export function setPaymentProviderReference(
  paymentId: string,
  providerReference: string,
) {
  return db.payment.update({
    where: { id: paymentId },
    data: { providerReference },
  });
}

// providerReference est unique en base : c'est la clé utilisée par le
// webhook pour retrouver le Payment correspondant à une notification, et
// c'est ce lookup + le check de statut déjà CONFIRME (service.ts) qui
// rendent le traitement du webhook idempotent.
export function findPaymentByProviderReference(providerReference: string) {
  return db.payment.findUnique({
    where: { providerReference },
    include: { order: { include: { items: true } } },
  });
}

export function recordPaymentEvent(
  paymentId: string,
  type: string,
  status: string,
  payload: unknown,
) {
  return db.paymentEvent.create({
    data: { paymentId, type, status, payload: payload as never },
  });
}

/**
 * Applique l'échec d'un paiement : Payment → ÉCHOUÉ, Order → ÉCHEC. Utilisé
 * aussi bien pour un statut ECHOUE explicite renvoyé par le prestataire que
 * pour un montant/devise vérifié qui ne correspond pas à la commande — dans
 * les deux cas, aucun Access n'est accordé (STACK TECHNIQUE §74).
 */
export async function markPaymentFailed(paymentId: string) {
  return db.$transaction(async (tx) => {
    const payment = await tx.payment.update({
      where: { id: paymentId },
      data: { status: "ECHOUE", failedAt: new Date() },
    });
    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: "ECHEC" },
    });
    return payment;
  });
}

/**
 * Applique la confirmation d'un paiement : Payment → CONFIRMÉ, Order →
 * PAYÉE, Access → ACTIF pour chaque produit de la commande. Tout dans une
 * transaction pour éviter un état partiellement appliqué (STACK TECHNIQUE
 * §74 ERREURS ET ROLLBACK).
 */
export async function confirmPaymentAndGrantAccess(paymentId: string) {
  return db.$transaction(async (tx) => {
    const payment = await tx.payment.update({
      where: { id: paymentId },
      data: { status: "CONFIRME", confirmedAt: new Date() },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: {
                  include: {
                    formation: { include: { parts: { include: { courses: true } } } },
                  },
                },
              },
            },
          },
        },
      },
    });

    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: "PAYEE", paidAt: new Date() },
    });

    for (const item of payment.order.items) {
      await tx.access.upsert({
        where: {
          userId_productId: {
            userId: payment.userId,
            productId: item.productId,
          },
        },
        update: { status: "ACTIF", grantedAt: new Date() },
        create: {
          userId: payment.userId,
          productId: item.productId,
          status: "ACTIF",
          grantedAt: new Date(),
        },
      });

      // RÈGLES MÉTIER §26 : « une nouvelle acquisition peut être nécessaire
      // pour reprendre » un cours fermé pour dépassement de délai — sans
      // cette réouverture, un nouveau paiement confirmé accordait bien un
      // Access ACTIF mais getCourseAccessState restait bloqué sur
      // CLOSED_FOR_DELAY (eligibilityStatus="FERME" vérifié en premier),
      // rendant le paiement sans effet (bug corrigé le 24/08/2026).
      const courseIds = item.product.courseId
        ? [item.product.courseId]
        : (item.product.formation?.parts.flatMap((part) =>
            part.courses.map((course) => course.id),
          ) ?? []);

      if (courseIds.length > 0) {
        await tx.courseProgress.updateMany({
          where: {
            userId: payment.userId,
            courseId: { in: courseIds },
            eligibilityStatus: "FERME",
          },
          data: { eligibilityStatus: "ELIGIBLE" },
        });
      }
    }

    return payment;
  });
}
