import { handleRoute, ok } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guards";
import { userHasPermission } from "@/lib/auth/permissions";
import { getDownloadUrl } from "@/modules/files/service";

interface Params {
  params: Promise<{ id: string }>;
}

// Garde-fou anti-IDOR : un fileId est devinable/énumérable, donc
// modules/files/service.ts getDownloadUrl vérifie que le fichier appartient
// à user.id, sauf pour le Seuil (MANAGE_FILES) qui peut tout télécharger.
export const GET = handleRoute(async (_req, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  const canManageAll = await userHasPermission(user.id, "MANAGE_FILES");
  const url = await getDownloadUrl(id, user.id, canManageAll);
  return ok({ url });
});
