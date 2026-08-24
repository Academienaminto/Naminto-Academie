import { handleRoute, ok } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guards";
import { userHasPermission } from "@/lib/auth/permissions";
import { sendMessageSchema } from "@/modules/messaging/validation";
import { reply } from "@/modules/messaging/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const POST = handleRoute(async (req, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  const body = sendMessageSchema.parse(await req.json());
  const canManageAll = await userHasPermission(user.id, "MANAGE_MESSAGES");
  const message = await reply(id, user.id, body.content, canManageAll);
  return ok(message, 201);
});
