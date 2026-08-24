// RÈGLES MÉTIER §23-26 — valeurs par défaut (23/08/2026, configurables par
// le Seuil via l'entité RULE, non encore exposées en UI) :
export const DEADLINE_DURATION_DAYS = 30; // durée par défaut du délai d'un cours
export const ALERT_INTERVAL_DAYS = 7; // écart entre ALERTE 1 → 2 → 3

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
