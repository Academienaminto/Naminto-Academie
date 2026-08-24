import { handleRoute, ok } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guards";
import { userHasPermission } from "@/lib/auth/permissions";
import { getConversation } from "@/modules/messaging/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const GET = handleRoute(async (_req, { params }: Params) => {
  // Le contrôle anti-IDOR (la conversation appartient-elle à user.id, sauf
  // si canManageAll) n'est pas visible ici : il est fait dans
  // modules/messaging/service.ts (loadConversationForUser), pas dans la route.
  const user = await requireUser();
  const { id } = await params;
  const canManageAll = await userHasPermission(user.id, "MANAGE_MESSAGES");
  const conversation = await getConversation(id, user.id, canManageAll);
  return ok(conversation);
});
