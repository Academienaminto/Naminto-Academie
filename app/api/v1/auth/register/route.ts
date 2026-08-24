import { handleRoute, ok } from "@/lib/api/response";
import { AppError } from "@/lib/errors";
import { getClientIp, isRateLimited } from "@/lib/security/rate-limit";
import { registerSchema } from "@/modules/auth/validation";
import { register } from "@/modules/auth/service";
import { toPublicUser } from "@/modules/auth/serializer";

// Même logique que /auth/login (audit de sécurité du 23/08/2026) : limite
// la création automatisée de comptes en masse.
export const POST = handleRoute(async (req) => {
  const ip = getClientIp(req);
  if (isRateLimited(`register:ip:${ip}`, 10, 60_000)) {
    throw new AppError(
      "RATE_LIMITED",
      "Trop de tentatives d'inscription. Réessayez dans une minute.",
    );
  }

  const body = registerSchema.parse(await req.json());
  const user = await register(body);
  return ok(toPublicUser(user), 201);
});
