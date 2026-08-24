import { handleRoute, ok } from "@/lib/api/response";
import { AppError } from "@/lib/errors";
import { getClientIp, isRateLimited } from "@/lib/security/rate-limit";
import { resendVerificationSchema } from "@/modules/auth/validation";
import { resendVerificationEmail } from "@/modules/auth/service";

export const POST = handleRoute(async (req) => {
  const ip = getClientIp(req);
  if (isRateLimited(`resend-verification:ip:${ip}`, 5, 60_000)) {
    throw new AppError(
      "RATE_LIMITED",
      "Trop de tentatives. Réessayez dans une minute.",
    );
  }

  const body = resendVerificationSchema.parse(await req.json());
  await resendVerificationEmail(body.email);
  return ok({ sent: true });
});
