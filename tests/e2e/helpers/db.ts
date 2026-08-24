import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();

// Un compte de test réel accumule des effets de bord (notifications,
// séances, délais, événements, mais aussi des chaînes à deux niveaux
// comme AccountDeletion -> AccountRestoration, qui référence
// account_deletions.id et non user_id directement) à travers des tables
// qu'on ne veut pas toutes énumérer à la main ici — et qui évolueront
// avec le produit. On supprime donc récursivement : à chaque violation de
// clé étrangère, on demande à Postgres lui-même (pg_constraint) la table
// source de la contrainte bloquante — jamais en la devinant par regex sur
// le nom de la contrainte, qui est ambigu dès qu'une table ou une colonne
// contient elle-même un underscore (ex. "password_credentials_user_id_fkey"
// : impossible de savoir sans introspection où la table s'arrête et où la
// colonne commence).
async function tableFromConstraint(constraint: string): Promise<string | null> {
  const rows = await db.$queryRaw<{ table_name: string }[]>`
    SELECT conrelid::regclass::text AS table_name
    FROM pg_constraint
    WHERE conname = ${constraint}
  `;
  return rows[0]?.table_name ?? null;
}

async function deleteAllRows(table: string, maxAttempts = 20): Promise<void> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await db.$executeRawUnsafe(`DELETE FROM "${table}"`);
      return;
    } catch (err) {
      const meta = (err as { code?: string; meta?: { constraint?: string } }).meta;
      const code = (err as { code?: string }).code;
      const blockingTable =
        (code === "P2003" || code === "P2010") && meta?.constraint
          ? await tableFromConstraint(meta.constraint)
          : null;
      if (!blockingTable || blockingTable === table) throw err;
      await deleteAllRows(blockingTable, maxAttempts);
    }
  }
  throw new Error(`deleteAllRows: trop de tentatives pour ${table}`);
}

async function deleteUserCascading(userId: string, maxAttempts = 20) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await db.user.delete({ where: { id: userId } });
      return;
    } catch (err) {
      const meta = (err as { code?: string; meta?: { constraint?: string } }).meta;
      const code = (err as { code?: string }).code;
      if ((code !== "P2003" && code !== "P2010") || !meta?.constraint) throw err;
      const table = await tableFromConstraint(meta.constraint);
      if (!table) throw err;
      // La table bloquante référence bien user_id ici (premier niveau,
      // sinon on ne serait pas bloqué en supprimant `users`) — cibler par
      // userId reste plus sûr que vider la table entière à ce niveau-là.
      try {
        await db.$executeRawUnsafe(
          `DELETE FROM "${table}" WHERE user_id = $1`,
          userId,
        );
      } catch (innerErr) {
        const innerMeta = (innerErr as { code?: string; meta?: { constraint?: string } }).meta;
        const innerCode = (innerErr as { code?: string }).code;
        const innerTable =
          (innerCode === "P2003" || innerCode === "P2010") && innerMeta?.constraint
            ? await tableFromConstraint(innerMeta.constraint)
            : null;
        if (!innerTable) throw innerErr;
        await deleteAllRows(innerTable, maxAttempts);
        await db.$executeRawUnsafe(
          `DELETE FROM "${table}" WHERE user_id = $1`,
          userId,
        );
      }
    }
  }
  throw new Error(`deleteUserCascading: trop de tentatives pour ${userId}`);
}

export async function deleteUserByEmail(email: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return;
  await deleteUserCascading(user.id);
}

/**
 * Court-circuite la vérification d'email (§72) pour les tests E2E : ils
 * n'ont pas accès à la boîte mail réelle, donc pas au token envoyé par
 * lib/email/send.ts. Même principe que grantSeuilRole : manipulation
 * directe en base réservée aux fixtures de test.
 */
export async function markEmailVerified(email: string) {
  await db.user.update({
    where: { email },
    data: { emailVerifiedAt: new Date() },
  });
}

export async function grantSeuilRole(email: string) {
  const user = await db.user.findUniqueOrThrow({ where: { email } });
  const role = await db.role.findUniqueOrThrow({ where: { name: "SEUIL" } });
  await db.userRole.create({ data: { userId: user.id, roleId: role.id } });
}
