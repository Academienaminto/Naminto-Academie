import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { getDocument } from "@/modules/documents/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const GET = handleRoute(async (_req, { params }: Params) => {
  await requirePermission("MANAGE_FILES");
  const { id } = await params;
  const document = await getDocument(id);
  return ok(document);
});
