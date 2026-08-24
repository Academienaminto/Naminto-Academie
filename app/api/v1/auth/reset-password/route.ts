import { handleRoute, ok } from "@/lib/api/response";
import { AppError } from "@/lib/errors";
import { getClientIp, isRateLimited } from "@/lib/security/rate-limit";
import { resetPasswordSchema } from "@/modules/auth/validation";
import { resetPassword } from "@/modules/auth/service";
import { toPublicUser } from "@/modules/auth/serializer";
import { userHasRole } from "@/lib/auth/permissions";

export const POST = handleRoute(async (req) => {
  const ip = getClientIp(req);
  if (isRateLimited(`reset-password:ip:${ip}`, 10, 60_000)) {
    throw new AppError(
      "RATE_LIMITED",
      "Trop de tentatives. Réessayez dans une minute.",
    );
  }

  const body = resetPasswordSchema.parse(await req.json());
  const user = await resetPassword(body.token, body.password);
  const isSeuil = await userHasRole(user!.id, "SEUIL");
  return ok({ ...toPublicUser(user!), isSeuil });
});
