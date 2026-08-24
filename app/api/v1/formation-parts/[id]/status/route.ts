import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { publishSchema } from "@/modules/cursus/validation";
import { setPartStatus } from "@/modules/formations/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const PATCH = handleRoute(async (req, { params }: Params) => {
  await requirePermission("MANAGE_FORMATIONS");
  const { id } = await params;
  const body = publishSchema.parse(await req.json());
  const part = await setPartStatus(id, body);
  return ok(part);
});
