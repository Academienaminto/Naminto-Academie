import { handleRoute, ok } from "@/lib/api/response";
import { AppError } from "@/lib/errors";
import { getClientIp, isRateLimited } from "@/lib/security/rate-limit";
import { requestPasswordResetSchema } from "@/modules/auth/validation";
import { requestPasswordReset } from "@/modules/auth/service";

export const POST = handleRoute(async (req) => {
  const ip = getClientIp(req);
  if (isRateLimited(`forgot-password:ip:${ip}`, 5, 60_000)) {
    throw new AppError(
      "RATE_LIMITED",
      "Trop de tentatives. Réessayez dans une minute.",
    );
  }

  const body = requestPasswordResetSchema.parse(await req.json());
  await requestPasswordReset(body.email);
  return ok({ sent: true });
});
