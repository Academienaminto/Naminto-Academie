import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { createCommentSchema } from "@/modules/blog/validation";
import { addComment } from "@/modules/blog/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const POST = handleRoute(async (req, { params }: Params) => {
  const user = await requirePermission("COMMENT_BLOG");
  const { id } = await params;
  const body = createCommentSchema.parse(await req.json());
  const comment = await addComment(id, user.id, body);
  return ok(comment, 201);
});
