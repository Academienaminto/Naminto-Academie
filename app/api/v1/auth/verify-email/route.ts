import { handleRoute, ok } from "@/lib/api/response";
import { verifyEmailSchema } from "@/modules/auth/validation";
import { verifyEmail } from "@/modules/auth/service";
import { toPublicUser } from "@/modules/auth/serializer";
import { userHasRole } from "@/lib/auth/permissions";

export const POST = handleRoute(async (req) => {
  const body = verifyEmailSchema.parse(await req.json());
  const user = await verifyEmail(body.token);
  const isSeuil = await userHasRole(user!.id, "SEUIL");
  return ok({ ...toPublicUser(user!), isSeuil });
});
