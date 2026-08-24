import { handleRoute, ok } from "@/lib/api/response";
import { tryGetUser } from "@/lib/auth/guards";
import { userHasPermission } from "@/lib/auth/permissions";
import { getCourse } from "@/modules/cursus/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const GET = handleRoute(async (_req, { params }: Params) => {
  // Même garde que pour un cursus/formation : un cours en brouillon répond
  // 404 sauf pour le Seuil (MANAGE_COURSES).
  const { id } = await params;
  const user = await tryGetUser();
  const canManageAll = user ? await userHasPermission(user.id, "MANAGE_COURSES") : false;
  const course = await getCourse(id, canManageAll);
  return ok(course);
});
