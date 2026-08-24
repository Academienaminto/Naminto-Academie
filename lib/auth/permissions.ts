import { db } from "@/lib/db";

// PROMPT MASTER AUTORISATION : UTILISATEUR → AUTHENTIFICATION → ÉTAT DU
// COMPTE → RÔLE → PERMISSION → RESSOURCE → ÉTAT DE LA RESSOURCE →
// CONDITION MÉTIER → ACTION → AUTORISATION/REFUS.
// Le catalogue des rôles/permissions fait foi dans RÔLES ET PERMISSIONS
// NAMINTO ACADÉMIE.docx et est chargé en base par prisma/seed.ts.
// Ces fonctions sont les seules à interroger UserRole/RolePermission ;
// lib/auth/guards.ts (requirePermission, requireSeuil) s'appuie dessus et
// ne doit jamais être contourné par une vérification de rôle ad hoc ailleurs.

export async function userHasRole(
  userId: string,
  roleName: string,
): Promise<boolean> {
  const count = await db.userRole.count({
    where: { userId, role: { name: roleName } },
  });
  return count > 0;
}

export async function userHasPermission(
  userId: string,
  permissionName: string,
): Promise<boolean> {
  const count = await db.rolePermission.count({
    where: {
      permission: { name: permissionName },
      role: { users: { some: { userId } } },
    },
  });
  return count > 0;
}

export async function getUserRoleNames(userId: string): Promise<string[]> {
  const roles = await db.userRole.findMany({
    where: { userId },
    select: { role: { select: { name: true } } },
  });
  return roles.map((r) => r.role.name);
}
