import { handleRoute, ok } from "@/lib/api/response";
import { getFormation } from "@/modules/formations/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const GET = handleRoute(async (_req, { params }: Params) => {
  const { id } = await params;
  const formation = await getFormation(id);
  return ok(formation);
});
