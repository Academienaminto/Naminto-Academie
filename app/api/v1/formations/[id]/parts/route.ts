import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { createFormationPartSchema } from "@/modules/formations/validation";
import { addPart } from "@/modules/formations/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const POST = handleRoute(async (req, { params }: Params) => {
  await requirePermission("MANAGE_FORMATIONS");
  const { id } = await params;
  const body = createFormationPartSchema.parse(await req.json());
  const part = await addPart(id, body);
  return ok(part, 201);
});
