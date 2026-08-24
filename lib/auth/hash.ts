import * as argon2 from "argon2";

// Seule couche du système autorisée à manipuler un mot de passe en clair,
// et seulement le temps de le transformer en hash argon2id ou de le
// vérifier. Utilisé par modules/auth/service.ts (register, resetPassword,
// login, restoreOwnAccount). Invariant à ne jamais casser : un mot de passe
// en clair ne doit jamais remonter au-delà de cette frontière (pas de
// retour au client, pas de log).
//
// PROMPT MASTER AUTHENTIFICATION §8 : hash obligatoire, jamais de mot de
// passe en clair, jamais retourné au client, jamais journalisé.
export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, { type: argon2.argon2id });
}

export async function verifyPassword(
  hash: string,
  plain: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}

// Hash factice, calculé une seule fois puis mis en cache : sert uniquement
// à donner un coût Argon2id comparable au chemin "compte inexistant" de
// login()/restoreOwnAccount() (§10/§31 anti-énumération de comptes). Sans
// ça, le chemin "compte inexistant" retourne immédiatement alors que le
// chemin "compte existant" attend toujours une vérification Argon2id
// complète, ce qui laisse fuir l'existence d'un compte par la latence de
// réponse malgré un message d'erreur identique.
let dummyHash: Promise<string> | null = null;
function getDummyHash(): Promise<string> {
  dummyHash ??= argon2.hash("dummy-password-for-timing-safety", {
    type: argon2.argon2id,
  });
  return dummyHash;
}

/** Consomme le même temps qu'un verifyPassword réel, résultat ignoré. */
export async function wasteTimeLikeVerify(plain: string): Promise<void> {
  const hash = await getDummyHash();
  await verifyPassword(hash, plain);
}
