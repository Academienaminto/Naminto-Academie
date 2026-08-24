import { handleRoute, ok } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guards";
import { requireCourseAccess } from "@/modules/progress/service";
import { listMineForCourse } from "@/modules/sessions/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const GET = handleRoute(async (_req, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  await requireCourseAccess(user.id, id);
  const sessions = await listMineForCourse(user.id, id);
  return ok(sessions);
});
