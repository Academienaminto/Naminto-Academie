import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { createLevelSchema } from "@/modules/cursus/validation";
import { addLevel } from "@/modules/cursus/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const POST = handleRoute(async (req, { params }: Params) => {
  await requirePermission("MANAGE_LEVELS");
  const { id } = await params;
  const body = createLevelSchema.parse(await req.json());
  const level = await addLevel(id, body);
  return ok(level, 201);
});
