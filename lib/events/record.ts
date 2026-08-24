import { db } from "@/lib/db";

// Catalogue d'événements — sous-ensemble implémenté à ce stade. Voir
// ÉVÉNEMENTS NAMINTO ACADÉMIE pour le catalogue complet faisant foi ;
// ne pas diverger de cette nomenclature (réconciliation du 23/08/2026).
export type EventType =
  | "PAYMENT_CONFIRMED"
  | "ACCESS_GRANTED"
  | "COURSE_VALIDATED"
  | "COURSE_ELIGIBILITY_GRANTED"
  | "LEVEL_VALIDATED"
  | "GRADE_GRANTED"
  | "FORMATION_PART_VALIDATED"
  | "COURSE_DEADLINE_EXCEEDED"
  | "COURSE_DELAY_WARNING_2"
  | "COURSE_DELAY_WARNING_3"
  | "COURSE_CLOSED_FOR_DELAY"
  | "ACCOUNT_BLOCKED"
  | "ACCOUNT_UNBLOCKED"
  | "ACCOUNT_BANNED"
  | "ACCOUNT_DELETION_REQUESTED"
  | "ACCOUNT_RESTORED";

interface RecordEventParams {
  type: EventType;
  userId: string;
  entityType: string;
  entityId: string;
  payload?: Record<string, unknown>;
  /** Qui a déclenché l'événement — par défaut le système lui-même
   * (cascades pédagogiques, etc.). À renseigner explicitement pour les
   * actions administratives du Seuil (ESPACE DU SEUIL §54 : traçabilité
   * QUI → ACTION → RESSOURCE → DATE, en attendant le module Audit dédié). */
  actorType?: "SYSTEM" | "SEUIL" | "MEMBRE";
  actorId?: string;
}

/** Enregistre un événement métier. Ne déclenche rien lui-même : les
 * automatisations (notifications, etc.) restent explicites côté appelant
 * pour cette étape — un vrai bus d'événements découplé est une évolution
 * possible, pas un prérequis. */
export function recordEvent(params: RecordEventParams) {
  return db.event.create({
    data: {
      type: params.type,
      actorType: params.actorType ?? "SYSTEM",
      actorId: params.actorId,
      userId: params.userId,
      entityType: params.entityType,
      entityId: params.entityId,
      payload: params.payload as never,
      processingStatus: "TRAITE",
    },
  });
}
