import { handleRoute, ok } from "@/lib/api/response";
import { tryGetUser } from "@/lib/auth/guards";
import { userHasPermission } from "@/lib/auth/permissions";
import { getFormation } from "@/modules/formations/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const GET = handleRoute(async (_req, { params }: Params) => {
  // Même garde que GET /api/v1/formations (listCatalog vs listAll) : une
  // formation en brouillon répond 404 sauf pour le Seuil (MANAGE_FORMATIONS).
  const { id } = await params;
  const user = await tryGetUser();
  const canManageAll = user ? await userHasPermission(user.id, "MANAGE_FORMATIONS") : false;
  const formation = await getFormation(id, canManageAll);
  return ok(formation);
});
