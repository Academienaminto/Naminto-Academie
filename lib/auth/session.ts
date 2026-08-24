import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

// Gestion de session — PROMPT MASTER AUTHENTIFICATION & GESTION DES SESSIONS.
//
// Choix délibéré : pas de next-auth. Le Credentials provider de next-auth
// n'est pleinement supporté qu'en stratégie JWT ; or la règle métier impose
// une session serveur révocable, sans expiration arbitraire, jusqu'à
// déconnexion explicite (§8) — ce que seule une session base de données
// gérée nous-mêmes permet de garantir simplement. Voir NOTE DE FUSION du
// Prompt Master Authentification pour le principe général.
//
// Le cookie ne contient jamais l'id de session en clair : seul un hash
// (SHA-256) du jeton est stocké en base, pour qu'une fuite de la table
// Session ne permette pas de rejouer une session active (§11 côté prompt :
// "identifiants de session suffisamment difficiles à deviner").

const COOKIE_NAME = "naminto_session";

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/**
 * Crée une nouvelle session pour un utilisateur et pose le cookie.
 * Utilisé à la connexion, et pour régénérer l'identifiant de session
 * après une opération sensible (anti-fixation de session).
 */
export async function createSession(userId: string) {
  const token = generateToken();
  const session = await db.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      status: "ACTIVE",
    },
  });
  await setSessionCookie(token);
  return session;
}

/**
 * Lit la session active à partir du cookie de la requête courante.
 * Retourne null si aucun cookie, session invalide, ou compte non ACTIF.
 * Ne lève jamais d'erreur : à l'appelant de décider (AUTH_REQUIRED, etc.).
 */
export async function getCurrentSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { include: { account: true, profile: true } } },
  });

  if (!session || session.status !== "ACTIVE") return null;
  if (session.user.account?.status !== "ACTIF") return null;

  // Activité récente — utile pour l'audit et la détection d'anomalies,
  // sans jamais servir de base à une expiration automatique (§8).
  await db.session.update({
    where: { id: session.id },
    data: { lastActivityAt: new Date() },
  });

  return session;
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

/** Déconnexion : invalide la session côté serveur et efface le cookie. */
export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    await db.session
      .updateMany({
        where: { tokenHash: hashToken(token), status: "ACTIVE" },
        data: { status: "ENDED", endedAt: new Date() },
      })
      .catch(() => {
        // La session peut déjà avoir été invalidée ailleurs ; pas bloquant.
      });
  }
  await clearSessionCookie();
}

/** Déconnexion globale : invalide toutes les sessions actives d'un utilisateur. */
export async function destroyAllSessions(userId: string) {
  await db.session.updateMany({
    where: { userId, status: "ACTIVE" },
    data: { status: "ENDED", endedAt: new Date() },
  });
}
