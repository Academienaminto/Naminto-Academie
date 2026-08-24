import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { versionStatusSchema } from "@/modules/documents/validation";
import { setVersionStatus } from "@/modules/documents/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const PATCH = handleRoute(async (req, { params }: Params) => {
  await requirePermission("MANAGE_FILES");
  const { id } = await params;
  const body = versionStatusSchema.parse(await req.json());
  const version = await setVersionStatus(id, body.status);
  return ok(version);
});
