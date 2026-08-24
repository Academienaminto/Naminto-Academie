import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { postStatusSchema } from "@/modules/blog/validation";
import { setPostStatus } from "@/modules/blog/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const PATCH = handleRoute(async (req, { params }: Params) => {
  await requirePermission("MANAGE_BLOG");
  const { id } = await params;
  const body = postStatusSchema.parse(await req.json());
  const post = await setPostStatus(id, body.status);
  return ok(post);
});
