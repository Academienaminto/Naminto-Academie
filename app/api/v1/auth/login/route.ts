import { handleRoute, ok } from "@/lib/api/response";
import { AppError } from "@/lib/errors";
import { getClientIp, isRateLimited } from "@/lib/security/rate-limit";
import { loginSchema } from "@/modules/auth/validation";
import { login } from "@/modules/auth/service";
import { toPublicUser } from "@/modules/auth/serializer";
import { userHasRole } from "@/lib/auth/permissions";

// Protection contre le bourrage d'identifiants (credential stuffing) —
// audit de sécurité du 23/08/2026 : aucune limite n'existait auparavant.
// Deux fenêtres : une large par IP (repère un balayage multi-comptes),
// une stricte par IP+email (repère un acharnement sur un compte précis).
export const POST = handleRoute(async (req) => {
  const ip = getClientIp(req);
  const body = loginSchema.parse(await req.json());

  if (isRateLimited(`login:ip:${ip}`, 20, 60_000)) {
    throw new AppError(
      "RATE_LIMITED",
      "Trop de tentatives de connexion. Réessayez dans une minute.",
    );
  }
  if (isRateLimited(`login:ip-email:${ip}:${body.email}`, 5, 60_000)) {
    throw new AppError(
      "RATE_LIMITED",
      "Trop de tentatives de connexion pour ce compte. Réessayez dans une minute.",
    );
  }

  const user = await login(body);
  const isSeuil = await userHasRole(user.id, "SEUIL");
  return ok({ ...toPublicUser(user), isSeuil });
});
