import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { getMember } from "@/modules/members/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const GET = handleRoute(async (_req, { params }: Params) => {
  await requirePermission("MANAGE_USERS");
  const { id } = await params;
  const member = await getMember(id);
  return ok(member);
});
