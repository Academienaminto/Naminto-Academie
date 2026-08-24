import { AppError } from "@/lib/errors";
import { hashPassword, verifyPassword, wasteTimeLikeVerify } from "@/lib/auth/hash";
import {
  createSession,
  destroyAllSessions,
  destroySession,
  getCurrentUser,
} from "@/lib/auth/session";
import { issueEmailVerification, consumeEmailVerification } from "@/lib/auth/email-verification";
import { issuePasswordReset, consumePasswordReset } from "@/lib/auth/password-reset";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email/send";
import { isOnline } from "@/lib/auth/presence";
import {
  createUser,
  findLatestSeuilSession,
  findUserByEmail,
  findUserById,
  updatePasswordHash,
} from "@/modules/auth/repository";
import { restoreOwnAccount as restoreOwnAccountMembership } from "@/modules/members/service";
import type { LoginInput, RegisterInput } from "@/modules/auth/validation";

// Cœur métier de l'authentification : inscription, connexion, vérification
// d'email, mot de passe oublié/réinitialisation, déconnexion, restauration
// de compte par son titulaire. Orchestre lib/auth/* (hash, session, tokens)
// et modules/auth/repository.ts ; ne fait jamais d'accès Prisma direct.
// Invariant transverse : ne jamais laisser fuir d'information permettant
// l'énumération de comptes (§31) — voir les commentaires par fonction
// ci-dessous pour le comportement exact attendu à chaque point d'entrée.

/**
 * Inscription — VISITEUR → INSCRIPTION → COMPTE → AUTHENTIFICATION → MEMBRE.
 * Ne demande que les informations définies par le modèle officiel
 * (PROMPT MASTER AUTHENTIFICATION §5).
 */
export async function register(input: RegisterInput) {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    // Même message que pour une inscription réussie côté erreurs : on ne
    // confirme jamais explicitement qu'un email est déjà pris via un canal
    // qui permettrait l'énumération de comptes (§31 ÉNUMÉRATION DE COMPTES).
    // On reste toutefois explicite ici car c'est un formulaire d'inscription,
    // pas de connexion : l'utilisateur doit savoir quoi corriger.
    throw new AppError(
      "VALIDATION_ERROR",
      "Un compte existe déjà avec cet email.",
      undefined,
      "auth.emailTaken",
    );
  }

  const passwordHash = await hashPassword(input.password);
  const user = await createUser({
    email: input.email,
    phone: input.phone,
    language: input.language,
    passwordHash,
    firstName: input.firstName,
    lastName: input.lastName,
  });

  // §72 : la vérification d'email étant désormais une règle officielle,
  // aucune session n'est créée à l'inscription — seulement après clic sur
  // le lien reçu par email (voir verifyEmail ci-dessous).
  const token = await issueEmailVerification(user.id);
  await sendVerificationEmail(user.email, token, user.profile?.firstName ?? undefined);
  return user;
}

/**
 * Connexion — vérifie identité + mot de passe + état du compte.
 * Ne distingue jamais "compte inexistant" de "mot de passe incorrect"
 * (§10 COMPTE INEXISTANT).
 */
export async function login(input: LoginInput) {
  const user = await findUserByEmail(input.email);
  const genericError = new AppError(
    "INVALID_CREDENTIALS",
    "Email ou mot de passe incorrect.",
    undefined,
    "auth.invalidCredentials",
  );

  if (!user || !user.passwordAuth) {
    // §10/§31 : on paie le même coût Argon2id que le chemin "mot de passe
    // incorrect" ci-dessous, sinon la latence de réponse trahit à elle
    // seule l'existence du compte malgré le message d'erreur identique.
    await wasteTimeLikeVerify(input.password);
    throw genericError;
  }

  const validPassword = await verifyPassword(
    user.passwordAuth.passwordHash,
    input.password,
  );
  if (!validPassword) {
    throw genericError;
  }

  if (!user.emailVerifiedAt) {
    throw new AppError(
      "EMAIL_NOT_VERIFIED",
      "Confirmez votre adresse email avant de vous connecter. Vérifiez votre boîte mail.",
      undefined,
      "auth.emailNotVerified",
    );
  }

  const accountStatus = user.account?.status;
  if (accountStatus === "BANNI") {
    throw new AppError(
      "ACCOUNT_BANNED",
      "Ce compte a été banni.",
      undefined,
      "auth.accountBanned",
    );
  }
  if (accountStatus === "EN_SUPPRESSION") {
    // RÈGLES MÉTIER §7 : distinct de BLOQUÉ — l'utilisateur a un droit de
    // restauration pendant la période de récupération, le frontend a donc
    // besoin de ce code pour proposer l'action plutôt qu'un simple refus.
    throw new AppError(
      "ACCOUNT_PENDING_DELETION",
      "Ce compte est en cours de suppression. Vous pouvez le restaurer.",
      undefined,
      "auth.accountPendingDeletion",
    );
  }
  if (accountStatus !== "ACTIF") {
    // Couvre BLOQUÉ, SUPPRIMÉ (définitif, aucune restauration possible).
    throw new AppError(
      "ACCOUNT_BLOCKED",
      "Ce compte n'est pas accessible.",
      undefined,
      "auth.accountBlocked",
    );
  }

  await createSession(user.id);
  return user;
}

/**
 * RÈGLES MÉTIER §7 : le titulaire restaure lui-même son compte pendant la
 * période de récupération. Ne réutilise jamais login() (qui refuserait un
 * compte EN_SUPPRESSION) : le mot de passe est revérifié ici pour cette
 * seule action, sans créer de session tant que la restauration n'a pas
 * réussi — la connexion normale reprend ensuite via login().
 */
export async function restoreOwnAccount(input: LoginInput) {
  const user = await findUserByEmail(input.email);
  const genericError = new AppError(
    "INVALID_CREDENTIALS",
    "Email ou mot de passe incorrect.",
    undefined,
    "auth.invalidCredentials",
  );
  if (!user || !user.passwordAuth) {
    await wasteTimeLikeVerify(input.password);
    throw genericError;
  }
  const validPassword = await verifyPassword(
    user.passwordAuth.passwordHash,
    input.password,
  );
  if (!validPassword) {
    throw genericError;
  }
  if (user.account?.status !== "EN_SUPPRESSION") {
    throw new AppError(
      "INVALID_STATE",
      "Ce compte n'est pas en cours de suppression.",
      undefined,
      "auth.notPendingDeletion",
    );
  }

  await restoreOwnAccountMembership(user.id);
}

/**
 * Confirmation du lien reçu par email — consomme le token à usage unique
 * et connecte directement le membre (il vient de prouver mot de passe ET
 * possession de l'adresse email, §72).
 */
export async function verifyEmail(token: string) {
  const userId = await consumeEmailVerification(token);
  if (!userId) {
    throw new AppError(
      "INVALID_STATE",
      "Ce lien de vérification est invalide ou expiré.",
      undefined,
      "auth.verificationInvalid",
    );
  }
  await createSession(userId);
  return findUserById(userId);
}

/**
 * Renvoie l'email de vérification. Reste silencieux si le compte n'existe
 * pas ou est déjà vérifié (§31 — pas de canal d'énumération de comptes).
 */
export async function resendVerificationEmail(email: string) {
  const user = await findUserByEmail(email);
  if (!user || user.emailVerifiedAt) return;
  const token = await issueEmailVerification(user.id);
  await sendVerificationEmail(user.email, token, user.profile?.firstName ?? undefined);
}

/**
 * Mot de passe oublié — PROMPT MASTER AUTHENTIFICATION §28 : ne révèle
 * jamais si l'adresse possède un compte (reste silencieux dans tous les
 * cas, même §31 ÉNUMÉRATION DE COMPTES que resendVerificationEmail).
 */
export async function requestPasswordReset(email: string) {
  const user = await findUserByEmail(email);
  if (!user || !user.passwordAuth) return;
  const token = await issuePasswordReset(user.id);
  await sendPasswordResetEmail(user.email, token, user.profile?.firstName ?? undefined);
}

/**
 * §25-26 : le jeton reçu par email suffit à prouver l'identité pour cette
 * seule action. Toutes les sessions existantes sont révoquées (compromission
 * potentielle du mot de passe précédent), puis une nouvelle est ouverte
 * pour ce même geste de réinitialisation — cohérent avec verifyEmail.
 */
export async function resetPassword(token: string, newPassword: string) {
  const userId = await consumePasswordReset(token);
  if (!userId) {
    throw new AppError(
      "INVALID_STATE",
      "Ce lien de réinitialisation est invalide ou expiré.",
      undefined,
      "auth.resetInvalid",
    );
  }
  const passwordHash = await hashPassword(newPassword);
  await updatePasswordHash(userId, passwordHash);
  await destroyAllSessions(userId);
  await createSession(userId);
  return findUserById(userId);
}

/** Déconnexion — invalide la session côté serveur (§9). */
export async function logout() {
  await destroySession();
}

export async function me() {
  return getCurrentUser();
}

/** Présence du Seuil côté membre — voir lib/auth/presence.ts. */
export async function isSeuilOnline() {
  const session = await findLatestSeuilSession();
  return isOnline(session?.lastActivityAt ?? null);
}
