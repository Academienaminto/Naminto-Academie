import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { publishSchema } from "@/modules/cursus/validation";
import { setCourseStatus } from "@/modules/cursus/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const PATCH = handleRoute(async (req, { params }: Params) => {
  await requirePermission("MANAGE_COURSES");
  const { id } = await params;
  const body = publishSchema.parse(await req.json());
  const course = await setCourseStatus(id, body);
  return ok(course);
});
