import { db } from "@/lib/db";

// RÈGLES MÉTIER §69 : les opérations sensibles doivent identifier acteur,
// action, objet, ancien état, nouvel état, date, contexte. Distinct du
// journal d'événements métier (lib/events/record.ts, qui alimente les
// notifications) — §80 PRINCIPES DE NON-FUSION : HISTORY ≠ AUDIT LOG.
//
// Sous-ensemble couvert à ce stade : administration des membres (blocage,
// déblocage, bannissement, suppression, restauration), réinitialisation
// d'un délai, fermeture d'un cours pour délai dépassé, validation d'une
// preuve pratique. Modification de prix / de règle / de rendez-vous /
// suppression de contenu restent à couvrir (fonctionnalités elles-mêmes
// pas encore construites ou pas encore modifiables une fois créées).
export type AuditAction =
  | "ACCOUNT_BLOCKED"
  | "ACCOUNT_UNBLOCKED"
  | "ACCOUNT_BANNED"
  | "ACCOUNT_DELETION_REQUESTED"
  | "ACCOUNT_RESTORED"
  | "DEADLINE_RESET"
  | "COURSE_CLOSED_FOR_DELAY"
  | "EVIDENCE_REVIEWED";

interface RecordAuditParams {
  actorType: "SEUIL" | "SYSTEM" | "MEMBRE";
  actorId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  oldValue?: unknown;
  newValue?: unknown;
  metadata?: unknown;
}

export function recordAudit(params: RecordAuditParams) {
  return db.auditLog.create({
    data: {
      actorType: params.actorType,
      actorId: params.actorId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      oldValue: params.oldValue as never,
      newValue: params.newValue as never,
      metadata: params.metadata as never,
    },
  });
}

export function listRecentAudit(take = 100) {
  return db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take });
}
