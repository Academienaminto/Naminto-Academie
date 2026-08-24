import { db } from "@/lib/db";

export function findUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email },
    include: { account: true, passwordAuth: true, profile: true },
  });
}

export function findUserById(id: string) {
  return db.user.findUnique({
    where: { id },
    include: { account: true, profile: true, roles: { include: { role: true } } },
  });
}

interface CreateUserInput {
  email: string;
  phone?: string;
  language: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Crée l'identité complète d'un nouveau membre en une seule transaction :
 * User + Account + Profile + PasswordCredential + rôle MEMBRE.
 * VISITEUR → INSCRIPTION → COMPTE (PROMPT MASTER AUTHENTIFICATION §2).
 */
export async function createUser(input: CreateUserInput) {
  const memberRole = await db.role.upsert({
    where: { name: "MEMBRE" },
    update: {},
    create: { name: "MEMBRE", description: "Membre authentifié" },
  });

  return db.user.create({
    data: {
      email: input.email,
      phone: input.phone,
      language: input.language,
      status: "ACTIF",
      account: { create: { status: "ACTIF" } },
      profile: {
        create: {
          firstName: input.firstName,
          lastName: input.lastName,
        },
      },
      passwordAuth: { create: { passwordHash: input.passwordHash } },
      roles: {
        create: { roleId: memberRole.id },
      },
    },
    include: { account: true, profile: true },
  });
}

export function updatePasswordHash(userId: string, passwordHash: string) {
  return db.passwordCredential.update({
    where: { userId },
    data: { passwordHash },
  });
}

/** Session active la plus récente parmi les comptes portant le rôle
 * SEUIL — sert à déterminer si « le Seuil » est en ligne côté membre. */
export async function findLatestSeuilSession() {
  return db.session.findFirst({
    where: {
      status: "ACTIVE",
      user: { roles: { some: { role: { name: "SEUIL" } } } },
    },
    orderBy: { lastActivityAt: "desc" },
    select: { lastActivityAt: true },
  });
}
