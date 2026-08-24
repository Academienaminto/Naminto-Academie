// Charge le catalogue de rôles/permissions défini dans
// RÔLES ET PERMISSIONS NAMINTO ACADÉMIE.docx (§3 à §16).
// Idempotent : peut être relancé sans dupliquer les lignes.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// VISITEUR n'est pas un rôle assignable (état par défaut non authentifié,
// voir §3) : seuls MEMBRE, APPRENANT et SEUIL existent en base.
const ROLES = ["MEMBRE", "APPRENANT", "SEUIL"] as const;

const MEMBRE_PERMISSIONS = [
  "VIEW_OWN_PROFILE",
  "EDIT_OWN_PROFILE",
  "MANAGE_NOTIFICATION_PREFERENCES",
  "DELETE_OWN_ACCOUNT",
  "REQUEST_ACCOUNT_RESTORATION",
  "BUY_PRODUCT",
  "VIEW_OWN_ORDERS",
  "VIEW_OWN_PAYMENTS",
  "DOWNLOAD_OWNED_BOOK",
  "SEND_MESSAGE",
  "REQUEST_APPOINTMENT",
  "COMMENT_BLOG",
];

// Cumulatif avec MEMBRE : un apprenant détient les deux rôles à la fois
// (voir §4 CUMUL DES RÔLES), donc ce rôle ne porte QUE les permissions
// spécifiques à l'état d'apprenant.
const APPRENANT_PERMISSIONS = [
  "ACCESS_COURSE",
  "TAKE_QUIZ",
  "UPLOAD_EVIDENCE",
  "VIEW_OWN_PROGRESS",
  "DOWNLOAD_COURSE_MATERIAL",
];

const SEUIL_PERMISSIONS = [
  "MANAGE_USERS",
  "BLOCK_ACCOUNT",
  "UNBLOCK_ACCOUNT",
  "BAN_ACCOUNT",
  "DELETE_ACCOUNT_ADMIN",
  "RESTORE_ACCOUNT_ADMIN",
  "MANAGE_CURSUS",
  "MANAGE_LEVELS",
  "MANAGE_COURSES",
  "MANAGE_FORMATIONS",
  "MANAGE_DEADLINES",
  "MANAGE_QUIZZES",
  "REVIEW_EVIDENCE",
  "MANAGE_GRADES",
  "MANAGE_BOOKS",
  "MANAGE_PRODUCTS",
  "MANAGE_PRICES",
  "MANAGE_PAYMENTS",
  "VIEW_FINANCE",
  "MANAGE_BLOG",
  "MODERATE_COMMENTS",
  "MANAGE_FILES",
  "MANAGE_MESSAGES",
  "MANAGE_APPOINTMENTS",
  "MANAGE_NOTIFICATIONS",
  "VIEW_AUDIT",
];

const ROLE_PERMISSIONS: Record<(typeof ROLES)[number], string[]> = {
  MEMBRE: MEMBRE_PERMISSIONS,
  APPRENANT: APPRENANT_PERMISSIONS,
  SEUIL: SEUIL_PERMISSIONS,
};

async function main() {
  const allPermissions = Array.from(
    new Set(Object.values(ROLE_PERMISSIONS).flat()),
  );

  for (const name of allPermissions) {
    await db.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const roleName of ROLES) {
    const role = await db.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });

    for (const permissionName of ROLE_PERMISSIONS[roleName]) {
      const permission = await db.permission.findUniqueOrThrow({
        where: { name: permissionName },
      });
      await db.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  console.log(
    `Seed terminé : ${ROLES.length} rôles, ${allPermissions.length} permissions.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
