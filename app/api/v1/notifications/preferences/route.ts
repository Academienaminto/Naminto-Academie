import { handleRoute, ok } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guards";
import { updatePreferenceSchema } from "@/modules/notifications/validation";
import { getPreference, updatePreference } from "@/modules/notifications/service";

export const GET = handleRoute(async () => {
  const user = await requireUser();
  const preference = await getPreference(user.id);
  return ok(preference ?? { enabled: true, soundEnabled: true });
});

export const PATCH = handleRoute(async (req) => {
  const user = await requireUser();
  const body = updatePreferenceSchema.parse(await req.json());
  const preference = await updatePreference(user.id, body);
  return ok(preference);
});
