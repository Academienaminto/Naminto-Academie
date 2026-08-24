import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission, tryGetUser } from "@/lib/auth/guards";
import { userHasPermission } from "@/lib/auth/permissions";
import { createBookSchema } from "@/modules/books/validation";
import { createBook, listAll, listCatalog } from "@/modules/books/service";

// Public : visiteur/membre reçoit uniquement le catalogue publié
// (listCatalog). Le Seuil (MANAGE_BOOKS) reçoit tous les livres, brouillons
// compris (listAll) — voir modules/books/service.ts getBook pour la même
// logique appliquée au détail d'un livre.
export const GET = handleRoute(async () => {
  const user = await tryGetUser();
  const canManageAll = user
    ? await userHasPermission(user.id, "MANAGE_BOOKS")
    : false;
  const books = canManageAll ? await listAll() : await listCatalog();
  return ok(books);
});

export const POST = handleRoute(async (req) => {
  await requirePermission("MANAGE_BOOKS");
  const body = createBookSchema.parse(await req.json());
  const book = await createBook(body);
  return ok(book, 201);
});
