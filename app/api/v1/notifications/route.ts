import { handleRoute, ok } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guards";
import { listMine } from "@/modules/notifications/service";

export const GET = handleRoute(async () => {
  const user = await requireUser();
  const notifications = await listMine(user.id);
  return ok(notifications);
});
