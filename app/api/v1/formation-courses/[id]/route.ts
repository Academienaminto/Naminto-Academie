import { handleRoute, ok } from "@/lib/api/response";
import { tryGetUser } from "@/lib/auth/guards";
import { userHasPermission } from "@/lib/auth/permissions";
import { getCourse } from "@/modules/formations/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const GET = handleRoute(async (_req, { params }: Params) => {
  // Même garde que pour app/api/v1/courses/[id]/route.ts et
  // formations/[id]/route.ts : un cours de formation en brouillon répond
  // 404 sauf pour le Seuil (MANAGE_FORMATIONS).
  const { id } = await params;
  const user = await tryGetUser();
  const canManageAll = user ? await userHasPermission(user.id, "MANAGE_FORMATIONS") : false;
  const course = await getCourse(id, canManageAll);
  return ok(course);
});
