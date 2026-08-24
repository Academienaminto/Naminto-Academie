import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { moderateCommentSchema } from "@/modules/blog/validation";
import { moderateComment } from "@/modules/blog/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const PATCH = handleRoute(async (req, { params }: Params) => {
  await requirePermission("MODERATE_COMMENTS");
  const { id } = await params;
  const body = moderateCommentSchema.parse(await req.json());
  const comment = await moderateComment(id, body.status);
  return ok(comment);
});
