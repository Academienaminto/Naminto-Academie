import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission, tryGetUser } from "@/lib/auth/guards";
import { userHasPermission } from "@/lib/auth/permissions";
import { updatePostSchema } from "@/modules/blog/validation";
import { getPost, updatePost } from "@/modules/blog/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const GET = handleRoute(async (_req, { params }: Params) => {
  // Même logique de visibilité que la liste (app/api/v1/blog/posts/route.ts) :
  // lecture publique, mais canManageAll (MANAGE_BLOG) est transmis au service
  // pour décider si un brouillon reste consultable par son id.
  const { id } = await params;
  const user = await tryGetUser();
  const canManageAll = user
    ? await userHasPermission(user.id, "MANAGE_BLOG")
    : false;
  const result = await getPost(id, canManageAll);
  return ok(result);
});

export const PATCH = handleRoute(async (req, { params }: Params) => {
  await requirePermission("MANAGE_BLOG");
  const { id } = await params;
  const body = updatePostSchema.parse(await req.json());
  const post = await updatePost(id, body);
  return ok(post);
});
