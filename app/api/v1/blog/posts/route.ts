import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission, tryGetUser } from "@/lib/auth/guards";
import { userHasPermission } from "@/lib/auth/permissions";
import { createPostSchema } from "@/modules/blog/validation";
import { createPost, listAllPosts, listPublished } from "@/modules/blog/service";

export const GET = handleRoute(async () => {
  // Le Seuil voit tous les statuts ; visiteurs et membres uniquement le
  // catalogue publié — la lecture du blog publié est publique (§ PROMPT
  // MASTER BLOG), donc pas d'authentification exigée ici.
  const user = await tryGetUser();
  const canManageAll = user
    ? await userHasPermission(user.id, "MANAGE_BLOG")
    : false;
  const posts = canManageAll ? await listAllPosts() : await listPublished();
  return ok(posts);
});

export const POST = handleRoute(async (req) => {
  const user = await requirePermission("MANAGE_BLOG");
  const body = createPostSchema.parse(await req.json());
  const post = await createPost(user.id, body);
  return ok(post, 201);
});
