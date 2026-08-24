import { handleRoute, ok } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guards";
import { requestOwnDeletion } from "@/modules/members/service";

// RÈGLES MÉTIER §6 : tout utilisateur peut demander la suppression de son
// propre compte, sans intervention du Seuil (distinct de
// app/api/v1/members/[id]/delete, qui est l'action équivalente déclenchée
// par un administrateur sur un AUTRE compte).
export const POST = handleRoute(async () => {
  const user = await requireUser();
  await requestOwnDeletion(user.id);
  return ok({ status: "EN_SUPPRESSION" });
});
