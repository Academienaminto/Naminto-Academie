import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission, tryGetUser } from "@/lib/auth/guards";
import { userHasPermission } from "@/lib/auth/permissions";
import { createBookSchema } from "@/modules/books/validation";
import { createBook, listAll, listCatalog } from "@/modules/books/service";

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
