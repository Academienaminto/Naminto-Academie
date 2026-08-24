import { timingSafeEqual } from "node:crypto";
import { handleRoute, ok } from "@/lib/api/response";
import { AppError } from "@/lib/errors";
import { processDueDeadlines } from "@/modules/deadlines/service";

// Point d'entrée destiné à un déclencheur externe planifié (cron), pas à un
// utilisateur connecté : cette application ne porte pas de worker en tâche
// de fond (STACK TECHNIQUE prévoit REDIS_URL pour une future file de
// tâches, non encore mise en place). Protégé par un secret partagé plutôt
// que par une session, faute d'utilisateur authentifié dans ce contexte.
function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // timingSafeEqual exige des buffers de même longueur — une différence de
  // longueur est déjà une non-correspondance, mais la comparer directement
  // fuiterait cette information par le timing ; on la traite donc à part.
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

export const POST = handleRoute(async (req) => {
  const secret = req.headers.get("x-cron-secret");
  const expected = process.env.DEADLINE_CRON_SECRET;
  if (!secret || !expected || !secretMatches(secret, expected)) {
    throw new AppError("FORBIDDEN", "Secret de déclenchement invalide.");
  }
  const result = await processDueDeadlines();
  return ok(result);
});
