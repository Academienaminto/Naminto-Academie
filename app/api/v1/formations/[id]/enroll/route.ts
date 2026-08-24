import { handleRoute, ok } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guards";
import { enroll } from "@/modules/formations/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const POST = handleRoute(async (_req, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  const enrollment = await enroll(user.id, id);
  return ok(enrollment, 201);
});
