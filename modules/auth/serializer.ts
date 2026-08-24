import type { Account, Profile, User } from "@prisma/client";

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
