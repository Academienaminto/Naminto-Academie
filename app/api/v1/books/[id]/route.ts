import { handleRoute, ok } from "@/lib/api/response";
import { tryGetUser } from "@/lib/auth/guards";
import { userHasPermission } from "@/lib/auth/permissions";
import { getBook } from "@/modules/books/service";

interface Params {
  params: Promise<{ id: string }>;
}

// Public : un livre non publié répond 404 pour un visiteur/membre, comme
// s'il n'existait pas. Le Seuil (MANAGE_BOOKS) voit aussi les brouillons
// (canManageAll=true) — voir modules/books/service.ts getBook.
export const GET = handleRoute(async (_req, { params }: Params) => {
  const { id } = await params;
  const user = await tryGetUser();
  const canManageAll = user ? await userHasPermission(user.id, "MANAGE_BOOKS") : false;
  const book = await getBook(id, canManageAll);
  return ok(book);
});
