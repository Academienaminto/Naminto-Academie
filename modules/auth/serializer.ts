import type { Account, Profile, User } from "@prisma/client";

// Point de passage obligatoire entre les entités Prisma (User/Account/
// Profile) et tout ce qui quitte le serveur (réponses API, props de
// Server Component). C'est ici, et seulement ici, que l'on décide quels
// champs sont exposables. Invariant critique : ne jamais ajouter de champ
// venant de PasswordCredential (passwordHash, etc.) au retour de
// toPublicUser — voir le commentaire sur la fonction ci-dessous.

type UserWithRelations = User & {
  account?: Account | null;
  profile?: Profile | null;
};

/**
 * Ne retourne jamais passwordHash, ni aucun champ de PasswordCredential.
 * Toute route qui renvoie un utilisateur doit passer par ce sérialiseur.
 */
export function toPublicUser(user: UserWithRelations) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    language: user.language,
    status: user.status,
    accountStatus: user.account?.status ?? null,
    firstName: user.profile?.firstName ?? null,
    lastName: user.profile?.lastName ?? null,
    displayName: user.profile?.displayName ?? null,
  };
}
