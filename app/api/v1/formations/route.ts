import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission, tryGetUser } from "@/lib/auth/guards";
import { userHasPermission } from "@/lib/auth/permissions";
import { createFormationSchema } from "@/modules/formations/validation";
import { createFormation, listAll, listCatalog } from "@/modules/formations/service";

export const GET = handleRoute(async () => {
  const user = await tryGetUser();
  const canManageAll = user
    ? await userHasPermission(user.id, "MANAGE_FORMATIONS")
    : false;
  const formations = canManageAll ? await listAll() : await listCatalog();
  return ok(formations);
});

export const POST = handleRoute(async (req) => {
  await requirePermission("MANAGE_FORMATIONS");
  const body = createFormationSchema.parse(await req.json());
  const formation = await createFormation(body);
  return ok(formation, 201);
});
