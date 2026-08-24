import * as argon2 from "argon2";

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
