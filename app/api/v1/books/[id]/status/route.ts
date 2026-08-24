import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { publishSchema } from "@/modules/cursus/validation";
import { setBookStatus } from "@/modules/books/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const PATCH = handleRoute(async (req, { params }: Params) => {
  await requirePermission("MANAGE_BOOKS");
  const { id } = await params;
  const body = publishSchema.parse(await req.json());
  const book = await setBookStatus(id, body);
  return ok(book);
});
