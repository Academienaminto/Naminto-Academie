import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { addCourseVersionSchema } from "@/modules/cursus/validation";
import { addCourseVersion } from "@/modules/cursus/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const POST = handleRoute(async (req, { params }: Params) => {
  await requirePermission("MANAGE_COURSES");
  const { id } = await params;
  const body = addCourseVersionSchema.parse(await req.json());
  const version = await addCourseVersion(id, body);
  return ok(version, 201);
});
