import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { createVersionSchema } from "@/modules/documents/validation";
import { addVersion } from "@/modules/documents/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const POST = handleRoute(async (req, { params }: Params) => {
  await requirePermission("MANAGE_FILES");
  const { id } = await params;
  const body = createVersionSchema.parse(await req.json());
  const version = await addVersion(id, body);
  return ok(version, 201);
});
