// Présence "en ligne" — approximation à partir de l'activité de session
// (Session.lastActivityAt, déjà mise à jour à chaque requête authentifiée
// dans lib/auth/session.ts:getCurrentSession). PROMPT MASTER STACK
// TECHNIQUE §2 prévoit Socket.io pour le temps réel, non câblé dans ce
// projet (voir README) — ce seuil offre une présence "quasi temps réel"
// sans dépendance supplémentaire, suffisante pour ce besoin.
export const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

export function isOnline(lastActivityAt: Date | null | undefined): boolean {
  if (!lastActivityAt) return false;
  return Date.now() - lastActivityAt.getTime() < ONLINE_THRESHOLD_MS;
}
