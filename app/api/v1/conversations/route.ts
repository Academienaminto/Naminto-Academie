import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission, requireUser } from "@/lib/auth/guards";
import { userHasPermission } from "@/lib/auth/permissions";
import { startConversationSchema } from "@/modules/messaging/validation";
import { listAll, listMine, startConversation } from "@/modules/messaging/service";

export const GET = handleRoute(async () => {
  const user = await requireUser();
  const canManageAll = await userHasPermission(user.id, "MANAGE_MESSAGES");
  const conversations = canManageAll ? await listAll() : await listMine(user.id);
  return ok(conversations);
});

export const POST = handleRoute(async (req) => {
  const user = await requirePermission("SEND_MESSAGE");
  const body = startConversationSchema.parse(await req.json());
  const conversation = await startConversation(user.id, body);
  return ok(conversation, 201);
});
