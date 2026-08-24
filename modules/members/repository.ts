import { db } from "@/lib/db";

// Couche d'accès aux données pour la gestion des membres côté Seuil :
// requêtes/écritures Prisma brutes, sans règle métier (celle-ci vit dans
// modules/members/service.ts, seul appelant attendu). Les fonctions
// markForDeletion/restoreAccount utilisent $transaction pour garder
// Account et AccountDeletion/AccountRestoration synchronisés en cas
// d'échec partiel — ne pas les scinder en appels séparés.

/** ESPACE DU SEUIL §10 — recherche par email, téléphone ou nom, sans avoir
 * à parcourir manuellement l'ensemble des membres. */
export function search(query: string | undefined) {
  return db.user.findMany({
    where: query
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
            { profile: { firstName: { contains: query, mode: "insensitive" } } },
            { profile: { lastName: { contains: query, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: {
      account: true,
      profile: true,
      roles: { include: { role: true } },
      sessions: {
        where: { status: "ACTIVE" },
        orderBy: { lastActivityAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export function findById(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    include: {
      account: true,
      profile: true,
      roles: { include: { role: true } },
      _count: { select: { enrollments: true, orders: true } },
    },
  });
}

/** ESPACE DU SEUIL §9 HISTORIQUE — s'appuie sur le journal d'événements
 * déjà en place (lib/events/record.ts) plutôt que de dupliquer un système
 * d'audit séparé, qui reste une phase distincte non encore construite. */
export function findRecentEvents(userId: string) {
  return db.event.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export function updateAccountStatus(userId: string, status: "ACTIF" | "BLOQUE" | "BANNI") {
  return db.account.update({ where: { userId }, data: { status } });
}

export function findRoleNames(userId: string) {
  return db.userRole
    .findMany({ where: { userId }, include: { role: true } })
    .then((rows) => rows.map((r) => r.role.name));
}

export function markForDeletion(userId: string, scheduledDeletionAt: Date) {
  return db.$transaction([
    db.account.update({ where: { userId }, data: { status: "EN_SUPPRESSION" } }),
    db.accountDeletion.upsert({
      where: { userId },
      update: {
        status: "EN_SUPPRESSION",
        requestedAt: new Date(),
        scheduledDeletionAt,
        restoredAt: null,
        deletedAt: null,
      },
      create: {
        userId,
        status: "EN_SUPPRESSION",
        scheduledDeletionAt,
      },
    }),
  ]);
}

export function findDeletion(userId: string) {
  return db.accountDeletion.findUnique({ where: { userId } });
}

export function restoreAccount(userId: string, deletionId: string, restoredBy: string) {
  return db.$transaction([
    db.account.update({ where: { userId }, data: { status: "ACTIF" } }),
    db.accountDeletion.update({
      where: { id: deletionId },
      data: { status: "RESTAUREE", restoredAt: new Date() },
    }),
    db.accountRestoration.create({
      data: {
        userId,
        deletionId,
        status: "RESTAUREE",
        restoredAt: new Date(),
        restoredBy,
      },
    }),
  ]);
}
