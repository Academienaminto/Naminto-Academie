import { handleRoute, ok } from "@/lib/api/response";
import { AppError } from "@/lib/errors";
import { getClientIp, isRateLimited } from "@/lib/security/rate-limit";
import { loginSchema } from "@/modules/auth/validation";
import { restoreOwnAccount } from "@/modules/auth/service";

// RÈGLES MÉTIER §7 : le titulaire d'un compte EN_SUPPRESSION peut le
// restaurer lui-même pendant la période de récupération. Pas de
// requireUser() ici : un compte EN_SUPPRESSION est justement rejeté par
// login(), donc aucune session n'existe — l'identité est reprouvée par
// mot de passe dans modules/auth/service.ts restoreOwnAccount. Même
// exposition qu'une connexion (vérifie un mot de passe), donc même
// limitation de débit.
export const POST = handleRoute(async (req) => {
  const ip = getClientIp(req);
  const body = loginSchema.parse(await req.json());

  if (isRateLimited(`account-restore:ip:${ip}`, 20, 60_000)) {
    throw new AppError(
      "RATE_LIMITED",
      "Trop de tentatives. Réessayez dans une minute.",
    );
  }
  if (isRateLimited(`account-restore:ip-email:${ip}:${body.email}`, 5, 60_000)) {
    throw new AppError(
      "RATE_LIMITED",
      "Trop de tentatives pour ce compte. Réessayez dans une minute.",
    );
  }

  await restoreOwnAccount(body);
  return ok({ status: "ACTIF" });
});
