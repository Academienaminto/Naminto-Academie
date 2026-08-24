import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { getCourseDownloadUrl } from "@/modules/cursus/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const GET = handleRoute(async (_req, { params }: Params) => {
  const user = await requirePermission("DOWNLOAD_COURSE_MATERIAL");
  const { id } = await params;
  const url = await getCourseDownloadUrl(user.id, id);
  return ok({ url });
});
