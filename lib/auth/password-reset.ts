import { randomBytes, createHash } from "node:crypto";
import { db } from "@/lib/db";

// Récupération de compte par email — PROMPT MASTER AUTHENTIFICATION
// §25-26-28 (jeton temporaire, sécurisé, hashé, à usage unique — même
// principe que lib/auth/email-verification.ts).

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 heure — plus court que la vérification d'email (§26 : temporaire)

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function issuePasswordReset(userId: string): Promise<string> {
  const token = generateToken();
  await db.passwordReset.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });
  return token;
}

/**
 * Réclamation atomique du jeton (même principe que
 * consumeEmailVerification) : évite qu'une double requête concurrente ne
 * consomme deux fois le même jeton à usage unique.
 */
export async function consumePasswordReset(token: string): Promise<string | null> {
  const tokenHash = hashToken(token);
  const now = new Date();
  const claimed = await db.passwordReset.updateMany({
    where: { tokenHash, consumedAt: null, expiresAt: { gt: now } },
    data: { consumedAt: now },
  });
  if (claimed.count === 0) return null;

  const record = await db.passwordReset.findUniqueOrThrow({ where: { tokenHash } });
  return record.userId;
}
