import { handleRoute, ok } from "@/lib/api/response";
import { tryGetUser } from "@/lib/auth/guards";
import { userHasPermission } from "@/lib/auth/permissions";
import { getBook } from "@/modules/books/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const GET = handleRoute(async (_req, { params }: Params) => {
  const { id } = await params;
  const user = await tryGetUser();
  const canManageAll = user ? await userHasPermission(user.id, "MANAGE_BOOKS") : false;
  const book = await getBook(id, canManageAll);
  return ok(book);
});
