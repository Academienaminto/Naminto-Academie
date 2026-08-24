import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { search } from "@/modules/members/service";

export const GET = handleRoute(async (req) => {
  await requirePermission("MANAGE_USERS");
  const q = new URL(req.url).searchParams.get("q") ?? undefined;
  const members = await search(q);
  return ok(members);
});
