// Limiteur de débit en mémoire — protection minimale contre le
// bourrage d'identifiants (credential stuffing) et le sondage abusif
// d'endpoints publics non authentifiés. Suffisant pour une instance
// unique ; un déploiement multi-instance nécessiterait un magasin
// partagé (STACK TECHNIQUE prévoit REDIS_URL pour une future file de
// tâches, non encore mis en place — le même Redis pourrait porter ce
// compteur le moment venu).
const buckets = new Map<string, number[]>();

/** Nettoyage opportuniste : évite une croissance illimitée de la Map pour
 * des clés qui ne sont plus jamais réutilisées (IP/email one-off). */
function sweep(now: number, windowMs: number) {
  for (const [key, timestamps] of buckets) {
    const kept = timestamps.filter((t) => now - t < windowMs);
    if (kept.length === 0) {
      buckets.delete(key);
    } else {
      buckets.set(key, kept);
    }
  }
}

/**
 * Fenêtre glissante : retourne true si `key` a dépassé `limit` appels sur
 * les `windowMs` dernières millisecondes. Chaque appel compte comme une
 * tentative, qu'elle soit ensuite acceptée ou non par l'appelant.
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (Math.random() < 0.01) {
    sweep(now, windowMs);
  }
  const timestamps = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  timestamps.push(now);
  buckets.set(key, timestamps);
  return timestamps.length > limit;
}

/**
 * IP source à partir des en-têtes de proxy standard — dégrade proprement
 * (limite alors globale plutôt que par IP) si l'en-tête est absent, ce qui
 * n'arrive pas derrière un déploiement standard (Vercel, la plupart des
 * reverse proxies).
 *
 * On prend la DERNIÈRE entrée de x-forwarded-for, pas la première : chaque
 * proxy de la chaîne AJOUTE l'IP de qui vient de se connecter à lui, il
 * n'écrase jamais ce que le client a fourni. La première entrée est donc
 * entièrement falsifiable par le client (il suffit d'envoyer soi-même
 * l'en-tête avec une IP arbitraire) ; seule la dernière entrée — ajoutée
 * par le proxy de confiance juste avant d'atteindre ce serveur — reflète
 * l'IP réelle du pair TCP, que le client ne peut pas usurper.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim());
    return parts[parts.length - 1];
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}
