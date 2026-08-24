import { handleRoute, ok } from "@/lib/api/response";
import { getCourse } from "@/modules/formations/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const GET = handleRoute(async (_req, { params }: Params) => {
  const { id } = await params;
  const course = await getCourse(id);
  return ok(course);
});
