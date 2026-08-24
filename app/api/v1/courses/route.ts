import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { createCourseSchema } from "@/modules/cursus/validation";
import { addCourse } from "@/modules/cursus/service";

export const POST = handleRoute(async (req) => {
  await requirePermission("MANAGE_COURSES");
  const body = createCourseSchema.parse(await req.json());
  const course = await addCourse(body);
  return ok(course, 201);
});
