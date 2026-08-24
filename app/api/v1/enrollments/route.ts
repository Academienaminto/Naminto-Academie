import { handleRoute, ok } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guards";
import { enrollSchema } from "@/modules/enrollment/validation";
import { enroll, listMine } from "@/modules/enrollment/service";

export const GET = handleRoute(async () => {
  const user = await requireUser();
  const enrollments = await listMine(user.id);
  return ok(enrollments);
});

export const POST = handleRoute(async (req) => {
  const user = await requireUser();
  const body = enrollSchema.parse(await req.json());
  const enrollment = await enroll(user.id, body.cursusId);
  return ok(enrollment, 201);
});
