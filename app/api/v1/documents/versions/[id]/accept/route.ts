import { handleRoute, ok } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guards";
import { acceptVersion } from "@/modules/documents/service";

interface Params {
  params: Promise<{ id: string }>;
}

// RÈGLES MÉTIER §63-64 : un membre peut accepter (« J'ai lu et j'accepte »)
// la version courante d'un document réglementaire (règlement intérieur,
// confidentialité). Aucune obligation d'acceptation n'est imposée à
// l'inscription — non spécifiée dans les Règles Métier, donc non ajoutée
// (règle de non-invention).
export const POST = handleRoute(async (_req, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  const acceptance = await acceptVersion(id, user.id);
  return ok(acceptance, 201);
});
