import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { addBookVersionSchema } from "@/modules/books/validation";
import { addVersion } from "@/modules/books/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const POST = handleRoute(async (req, { params }: Params) => {
  await requirePermission("MANAGE_BOOKS");
  const { id } = await params;
  const body = addBookVersionSchema.parse(await req.json());
  const version = await addVersion(id, body);
  return ok(version, 201);
});
