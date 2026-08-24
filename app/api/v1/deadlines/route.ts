import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { listAll } from "@/modules/deadlines/service";

export const GET = handleRoute(async () => {
  await requirePermission("MANAGE_DEADLINES");
  const deadlines = await listAll();
  return ok(deadlines);
});
