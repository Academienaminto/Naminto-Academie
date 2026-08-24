import { AppError } from "@/lib/errors";
import { recordEvent } from "@/lib/events/record";
import { recordAudit } from "@/lib/audit/record";
import { notify } from "@/modules/notifications/service";
import * as repo from "@/modules/members/repository";

// ESPACE DU SEUIL §9-16 : gestion des membres — recherche, fiche, blocage,
// déblocage, bannissement, suppression, restauration. Chaque action
// sensible (§54, RÈGLES MÉTIER §69 RÈGLES D'AUDIT) est doublement
// journalisée : lib/events/record.ts (déclenche les notifications) et
// lib/audit/record.ts (traçabilité acteur/ancien état/nouvel état,
// distincte — §80 PRINCIPES DE NON-FUSION : HISTORY ≠ AUDIT LOG).

export function search(query?: string) {
  return repo.search(query);
}

export async function getMember(userId: string) {
  const member = await repo.findById(userId);
  if (!member) {
    throw new AppError("RESOURCE_NOT_FOUND", "Membre introuvable.");
  }
  const events = await repo.findRecentEvents(userId);
  return { ...member, recentEvents: events };
}

/** Garde-fou de sécurité : le Seuil ne doit jamais pouvoir bloquer/bannir/
 * supprimer un autre compte du Seuil par cette interface (évite un
 * verrouillage accidentel de l'administration) — règle de bon sens, non
 * explicitement écrite dans les documents mais cohérente avec §54
 * PROTECTION DES ACTIONS SENSIBLES. */
async function assertNotSeuil(userId: string) {
  const roles = await repo.findRoleNames(userId);
  if (roles.includes("SEUIL")) {
    throw new AppError(
      "FORBIDDEN",
      "Impossible d'appliquer cette action à un compte du Seuil.",
    );
  }
}

async function loadAccount(userId: string) {
  const member = await repo.findById(userId);
  if (!member?.account) {
    throw new AppError("RESOURCE_NOT_FOUND", "Membre introuvable.");
  }
  return member;
}

/** ESPACE DU SEUIL §12 : MEMBRE → BLOQUER → CONFIRMATION → BACKEND → ÉTAT MODIFIÉ. */
export async function block(userId: string, seuilUserId: string) {
  await assertNotSeuil(userId);
  const member = await loadAccount(userId);
  if (member.account!.status !== "ACTIF") {
    throw new AppError("INVALID_STATE", "Seul un compte actif peut être bloqué.");
  }
  await repo.updateAccountStatus(userId, "BLOQUE");
  await recordAudit({
    actorType: "SEUIL",
    actorId: seuilUserId,
    action: "ACCOUNT_BLOCKED",
    entityType: "ACCOUNT",
    entityId: userId,
    oldValue: { status: member.account!.status },
    newValue: { status: "BLOQUE" },
  });
  const event = await recordEvent({
    type: "ACCOUNT_BLOCKED",
    userId,
    entityType: "ACCOUNT",
    entityId: userId,
    actorType: "SEUIL",
    actorId: seuilUserId,
  });
  await notify({
    userId,
    eventId: event.id,
    type: "ACCOUNT_BLOCKED",
    title: "Compte bloqué",
    message: "Votre compte a été bloqué par le Seuil. Contactez-nous pour plus d'informations.",
  });
}

/** ESPACE DU SEUIL §13. */
export async function unblock(userId: string, seuilUserId: string) {
  const member = await loadAccount(userId);
  if (member.account!.status !== "BLOQUE") {
    throw new AppError("INVALID_STATE", "Seul un compte bloqué peut être débloqué.");
  }
  await repo.updateAccountStatus(userId, "ACTIF");
  await recordAudit({
    actorType: "SEUIL",
    actorId: seuilUserId,
    action: "ACCOUNT_UNBLOCKED",
    entityType: "ACCOUNT",
    entityId: userId,
    oldValue: { status: member.account!.status },
    newValue: { status: "ACTIF" },
  });
  const event = await recordEvent({
    type: "ACCOUNT_UNBLOCKED",
    userId,
    entityType: "ACCOUNT",
    entityId: userId,
    actorType: "SEUIL",
    actorId: seuilUserId,
  });
  await notify({
    userId,
    eventId: event.id,
    type: "ACCOUNT_UNBLOCKED",
    title: "Compte débloqué",
    message: "Votre compte a été débloqué. Vous pouvez de nouveau vous connecter.",
  });
}

/** ESPACE DU SEUIL §14 : action distincte du simple blocage. */
export async function ban(userId: string, seuilUserId: string) {
  await assertNotSeuil(userId);
  const member = await loadAccount(userId);
  if (member.account!.status === "BANNI") {
    throw new AppError("INVALID_STATE", "Ce compte est déjà banni.");
  }
  await repo.updateAccountStatus(userId, "BANNI");
  await recordAudit({
    actorType: "SEUIL",
    actorId: seuilUserId,
    action: "ACCOUNT_BANNED",
    entityType: "ACCOUNT",
    entityId: userId,
    oldValue: { status: member.account!.status },
    newValue: { status: "BANNI" },
  });
  const event = await recordEvent({
    type: "ACCOUNT_BANNED",
    userId,
    entityType: "ACCOUNT",
    entityId: userId,
    actorType: "SEUIL",
    actorId: seuilUserId,
  });
  await notify({
    userId,
    eventId: event.id,
    type: "ACCOUNT_BANNED",
    title: "Compte banni",
    message: "Votre compte a été banni de Naminto Académie.",
  });
}

/**
 * Cœur partagé de la demande de suppression (RÈGLES MÉTIER §6 : tout
 * utilisateur peut demander sa propre suppression ; ESPACE DU SEUIL §15 :
 * le Seuil peut aussi la déclencher pour un membre). Le compte passe en
 * EN_SUPPRESSION, réversible pendant la période de récupération par
 * défaut (30 jours, RÈGLES MÉTIER §6).
 */
async function requestDeletion(
  userId: string,
  actor: { actorType: "SEUIL" | "MEMBRE"; actorId: string },
) {
  const member = await loadAccount(userId);
  if (member.account!.status === "EN_SUPPRESSION" || member.account!.status === "SUPPRIME") {
    throw new AppError(
      "INVALID_STATE",
      "Ce compte est déjà en cours de suppression.",
      undefined,
      "account.alreadyPendingDeletion",
    );
  }
  const scheduledDeletionAt = new Date();
  scheduledDeletionAt.setDate(scheduledDeletionAt.getDate() + 30);

  await repo.markForDeletion(userId, scheduledDeletionAt);
  await recordAudit({
    actorType: actor.actorType,
    actorId: actor.actorId,
    action: "ACCOUNT_DELETION_REQUESTED",
    entityType: "ACCOUNT",
    entityId: userId,
    oldValue: { status: member.account!.status },
    newValue: { status: "EN_SUPPRESSION", scheduledDeletionAt: scheduledDeletionAt.toISOString() },
  });
  const event = await recordEvent({
    type: "ACCOUNT_DELETION_REQUESTED",
    userId,
    entityType: "ACCOUNT",
    entityId: userId,
    payload: { scheduledDeletionAt: scheduledDeletionAt.toISOString() },
    actorType: actor.actorType,
    actorId: actor.actorId,
  });
  await notify({
    userId,
    eventId: event.id,
    type: "ACCOUNT_DELETION_REQUESTED",
    title: "Compte en cours de suppression",
    message: `Votre compte sera définitivement supprimé le ${scheduledDeletionAt.toLocaleDateString("fr-FR")} sauf restauration.`,
  });
}

/** ESPACE DU SEUIL §15 : le Seuil déclenche la suppression d'un membre. */
export async function markForDeletion(userId: string, seuilUserId: string) {
  await assertNotSeuil(userId);
  await requestDeletion(userId, { actorType: "SEUIL", actorId: seuilUserId });
}

/** RÈGLES MÉTIER §6 : un utilisateur demande lui-même la suppression de
 * son propre compte — aucun garde-fou "pas un Seuil" ici, un membre du
 * Seuil reste libre de supprimer son propre compte. */
export async function requestOwnDeletion(userId: string) {
  await requestDeletion(userId, { actorType: "MEMBRE", actorId: userId });
}

/**
 * Cœur partagé de la restauration (RÈGLES MÉTIER §7 : l'utilisateur peut
 * restaurer son propre compte pendant la période de récupération ;
 * ESPACE DU SEUIL §16 : le Seuil peut aussi restaurer un compte membre).
 */
async function restoreDeletedAccount(
  userId: string,
  actor: { actorType: "SEUIL" | "MEMBRE"; actorId: string },
) {
  const member = await loadAccount(userId);
  if (member.account!.status !== "EN_SUPPRESSION") {
    throw new AppError("INVALID_STATE", "Seul un compte en suppression peut être restauré.");
  }
  const deletion = await repo.findDeletion(userId);
  if (!deletion) {
    throw new AppError("RESOURCE_NOT_FOUND", "Aucune demande de suppression associée.");
  }

  await repo.restoreAccount(userId, deletion.id, actor.actorId);
  await recordAudit({
    actorType: actor.actorType,
    actorId: actor.actorId,
    action: "ACCOUNT_RESTORED",
    entityType: "ACCOUNT",
    entityId: userId,
    oldValue: { status: "EN_SUPPRESSION" },
    newValue: { status: "ACTIF" },
  });
  const event = await recordEvent({
    type: "ACCOUNT_RESTORED",
    userId,
    entityType: "ACCOUNT",
    entityId: userId,
    actorType: actor.actorType,
    actorId: actor.actorId,
  });
  await notify({
    userId,
    eventId: event.id,
    type: "ACCOUNT_RESTORED",
    title: "Compte restauré",
    message: "Votre compte a été restauré. Vous pouvez de nouveau vous connecter.",
  });
}

/** ESPACE DU SEUIL §16 : restaure le compte tant que la suppression n'est
 * pas définitive. */
export async function restore(userId: string, seuilUserId: string) {
  await restoreDeletedAccount(userId, { actorType: "SEUIL", actorId: seuilUserId });
}

/** RÈGLES MÉTIER §7 : le titulaire restaure lui-même son compte pendant
 * la période de récupération — voir modules/auth/service.ts
 * restoreOwnAccount pour la vérification de mot de passe qui précède
 * cet appel (un compte EN_SUPPRESSION ne passe jamais par login()). */
export async function restoreOwnAccount(userId: string) {
  await restoreDeletedAccount(userId, { actorType: "MEMBRE", actorId: userId });
}
