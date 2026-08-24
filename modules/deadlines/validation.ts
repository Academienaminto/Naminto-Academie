// Constantes et utilitaire de date du système de délai à 3 alertes :
// DEADLINE_DURATION_DAYS fixe l'échéance initiale (J+30) ; ALERT_INTERVAL_DAYS
// fixe l'écart entre chaque étape de la cascade (J+30 ALERTE 1 → J+37
// ALERTE 2 → J+44 ALERTE 3/fermeture, RÈGLES MÉTIER §23-26). Consommées par
// modules/deadlines/service.ts pour calculer startAt/dueAt et par
// processDueDeadlines pour le cutoff des alertes 2 et 3.
// RÈGLES MÉTIER §23-26 — valeurs par défaut (23/08/2026, configurables par
// le Seuil via l'entité RULE, non encore exposées en UI) :
export const DEADLINE_DURATION_DAYS = 30; // durée par défaut du délai d'un cours
export const ALERT_INTERVAL_DAYS = 7; // écart entre ALERTE 1 → 2 → 3

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
