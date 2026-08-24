import { randomBytes, createHash } from "node:crypto";
import { db } from "@/lib/db";

// Vérification d'email — PROMPT MASTER AUTHENTIFICATION §72 (règle
// introduite le 23/08/2026). Token hashé en base, jamais stocké en clair,
// même principe que lib/auth/session.ts.

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function issueEmailVerification(userId: string): Promise<string> {
  const token = generateToken();
  await db.emailVerification.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });
  return token;
}

/**
 * Retourne l'userId vérifié, ou null si le token est invalide/expiré/déjà
 * utilisé. La « réclamation » du token doit être une seule opération
 * atomique (updateMany conditionné sur consumedAt: null) : un simple
 * find-puis-update laisserait une fenêtre où deux requêtes concurrentes
 * (ex. double appel réseau en développement) liraient toutes deux le
 * token comme non consommé avant qu'aucune n'écrive.
 */
export async function consumeEmailVerification(token: string): Promise<string | null> {
  const tokenHash = hashToken(token);
  const now = new Date();
  const claimed = await db.emailVerification.updateMany({
    where: { tokenHash, consumedAt: null, expiresAt: { gt: now } },
    data: { consumedAt: now },
  });
  if (claimed.count === 0) return null;

  const record = await db.emailVerification.findUniqueOrThrow({ where: { tokenHash } });
  await db.user.update({
    where: { id: record.userId },
    data: { emailVerifiedAt: now },
  });
  return record.userId;
}
