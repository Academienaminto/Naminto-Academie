import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { documentStatusSchema } from "@/modules/documents/validation";
import { setDocumentStatus } from "@/modules/documents/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const PATCH = handleRoute(async (req, { params }: Params) => {
  await requirePermission("MANAGE_FILES");
  const { id } = await params;
  const body = documentStatusSchema.parse(await req.json());
  const document = await setDocumentStatus(id, body.status);
  return ok(document);
});
