import { AppError } from "@/lib/errors";
import { getCurrentUser } from "@/lib/auth/session";
import { userHasPermission, userHasRole } from "@/lib/auth/permissions";

// Garde-fous réutilisables par les routes API et les Server Components.
// Règle d'or (ARCHITECTURE GÉNÉRALE §70, PROMPT MASTER AUTORISATION) :
// "bouton caché ≠ sécurité" — ces vérifications s'exécutent toujours
// côté serveur, jamais déduites d'un état d'interface.

/** Exige une session valide. Lève AUTH_REQUIRED sinon. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppError("AUTH_REQUIRED", "Authentification requise.");
  }
  return user;
}

/** Comme getCurrentUser, mais nommé explicitement pour les routes à accès
 * mixte (visiteur + membre + Seuil avec des vues différentes) : ne lève
 * jamais, retourne null si non authentifié. */
export async function tryGetUser() {
  return getCurrentUser();
}

/** Exige une session valide ET une permission précise. Lève FORBIDDEN sinon. */
export async function requirePermission(permissionName: string) {
  const user = await requireUser();
  const allowed = await userHasPermission(user.id, permissionName);
  if (!allowed) {
    throw new AppError(
      "FORBIDDEN",
      "Vous n'avez pas la permission d'effectuer cette action.",
    );
  }
  return user;
}

/** Exige le rôle SEUIL. Utilisé pour toutes les routes d'administration. */
export async function requireSeuil() {
  const user = await requireUser();
  const isSeuil = await userHasRole(user.id, "SEUIL");
  if (!isSeuil) {
    throw new AppError("FORBIDDEN", "Réservé au Seuil.");
  }
  return user;
}
