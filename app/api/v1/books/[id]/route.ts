import { handleRoute, ok } from "@/lib/api/response";
import { getBook } from "@/modules/books/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const GET = handleRoute(async (_req, { params }: Params) => {
  const { id } = await params;
  const book = await getBook(id);
  return ok(book);
});
