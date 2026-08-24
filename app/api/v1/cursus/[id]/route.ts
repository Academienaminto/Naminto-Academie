import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission, tryGetUser } from "@/lib/auth/guards";
import { userHasPermission } from "@/lib/auth/permissions";
import { updateCursusSchema } from "@/modules/cursus/validation";
import { getCursus, updateCursus } from "@/modules/cursus/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const GET = handleRoute(async (_req, { params }: Params) => {
  // Même garde que GET /api/v1/cursus (listCatalog vs listAll) : un cursus
  // en brouillon répond 404 pour tout le monde sauf le Seuil (MANAGE_CURSUS).
  const { id } = await params;
  const user = await tryGetUser();
  const canManageAll = user ? await userHasPermission(user.id, "MANAGE_CURSUS") : false;
  const cursus = await getCursus(id, canManageAll);
  return ok(cursus);
});

export const PATCH = handleRoute(async (req, { params }: Params) => {
  await requirePermission("MANAGE_CURSUS");
  const { id } = await params;
  const body = updateCursusSchema.parse(await req.json());
  const cursus = await updateCursus(id, body);
  return ok(cursus);
});
