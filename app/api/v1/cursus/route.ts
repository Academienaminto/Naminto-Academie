import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission, tryGetUser } from "@/lib/auth/guards";
import { userHasPermission } from "@/lib/auth/permissions";
import { createCursusSchema } from "@/modules/cursus/validation";
import { createCursus, listAll, listCatalog } from "@/modules/cursus/service";

export const GET = handleRoute(async () => {
  // Lecture publique : visiteurs et membres ne voient que le catalogue
  // publié (listCatalog) ; canManageAll (MANAGE_CURSUS) bascule sur listAll
  // pour exposer aussi les cursus en brouillon au Seuil.
  const user = await tryGetUser();
  const canManageAll = user
    ? await userHasPermission(user.id, "MANAGE_CURSUS")
    : false;
  const cursus = canManageAll ? await listAll() : await listCatalog();
  return ok(cursus);
});

export const POST = handleRoute(async (req) => {
  await requirePermission("MANAGE_CURSUS");
  const body = createCursusSchema.parse(await req.json());
  const cursus = await createCursus(body);
  return ok(cursus, 201);
});
