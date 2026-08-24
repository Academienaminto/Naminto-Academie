import { handleRoute, ok } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guards";
import { userHasPermission } from "@/lib/auth/permissions";
import { getDownloadUrl } from "@/modules/files/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const GET = handleRoute(async (_req, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  const canManageAll = await userHasPermission(user.id, "MANAGE_FILES");
  const url = await getDownloadUrl(id, user.id, canManageAll);
  return ok({ url });
});
