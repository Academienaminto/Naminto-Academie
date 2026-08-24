import { handleRoute, ok } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guards";
import { userHasPermission } from "@/lib/auth/permissions";
import { updateConversationStatusSchema } from "@/modules/messaging/validation";
import { setConversationStatus } from "@/modules/messaging/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const PATCH = handleRoute(async (req, { params }: Params) => {
  // Anti-IDOR délégué au service (comme GET .../[id]) : setConversationStatus
  // vérifie la propriété via loadConversationForUser avant toute transition.
  const user = await requireUser();
  const { id } = await params;
  const body = updateConversationStatusSchema.parse(await req.json());
  const canManageAll = await userHasPermission(user.id, "MANAGE_MESSAGES");
  const conversation = await setConversationStatus(id, user.id, canManageAll, body);
  return ok(conversation);
});
