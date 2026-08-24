import { handleRoute, ok } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guards";
import { markRead } from "@/modules/notifications/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const PATCH = handleRoute(async (_req, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  const notification = await markRead(user.id, id);
  return ok(notification);
});
