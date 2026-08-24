import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission, tryGetUser } from "@/lib/auth/guards";
import { userHasPermission } from "@/lib/auth/permissions";
import { createDocumentSchema } from "@/modules/documents/validation";
import { createDocument, listAll, listPublished } from "@/modules/documents/service";

// Public : visiteur/membre reçoit uniquement les documents publiés
// (listPublished). Le Seuil (MANAGE_FILES) reçoit tous les documents,
// brouillons compris (listAll) — même logique que app/api/v1/books/route.ts.
export const GET = handleRoute(async () => {
  const user = await tryGetUser();
  const canManageAll = user ? await userHasPermission(user.id, "MANAGE_FILES") : false;
  const documents = canManageAll ? await listAll() : await listPublished();
  return ok(documents);
});

export const POST = handleRoute(async (req) => {
  await requirePermission("MANAGE_FILES");
  const body = createDocumentSchema.parse(await req.json());
  const document = await createDocument(body);
  return ok(document, 201);
});
