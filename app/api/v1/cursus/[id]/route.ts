import { handleRoute, ok } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/guards";
import { updateCursusSchema } from "@/modules/cursus/validation";
import { getCursus, updateCursus } from "@/modules/cursus/service";

interface Params {
  params: Promise<{ id: string }>;
}

export const GET = handleRoute(async (_req, { params }: Params) => {
  const { id } = await params;
  const cursus = await getCursus(id);
  return ok(cursus);
});

export const PATCH = handleRoute(async (req, { params }: Params) => {
  await requirePermission("MANAGE_CURSUS");
  const { id } = await params;
  const body = updateCursusSchema.parse(await req.json());
  const cursus = await updateCursus(id, body);
  return ok(cursus);
});
