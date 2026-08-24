import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { createFormationCourseSchema } from "@/modules/formations/validation";
import { addCourse } from "@/modules/formations/service";

export const POST = handleRoute(async (req) => {
  await requirePermission("MANAGE_FORMATIONS");
  const body = createFormationCourseSchema.parse(await req.json());
  const course = await addCourse(body);
  return ok(course, 201);
});
