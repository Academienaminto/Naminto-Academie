import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { getDownloadUrl } from "@/modules/books/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const GET = handleRoute(async (_req, { params }: Params) => {
  const user = await requirePermission("DOWNLOAD_OWNED_BOOK");
  const { id } = await params;
  const url = await getDownloadUrl(user.id, id);
  return ok({ url });
});
