import { cookies } from "next/headers";
import { handleRoute, ok } from "@/lib/api/response";
import { AppError } from "@/lib/errors";
import { LOCALE_COOKIE } from "@/lib/i18n/locale";
import { LOCALES } from "@/lib/i18n/dictionaries";

// PROMPT MASTER INTERNATIONALISATION §3-4 : le visiteur peut changer de
// langue sans créer de compte ni modifier son statut — aucune
// authentification requise ici.
export const POST = handleRoute(async (req) => {
  const body = await req.json();
  if (!LOCALES.includes(body.locale)) {
    throw new AppError("VALIDATION_ERROR", "Langue non prise en charge.");
  }
  const store = await cookies();
  store.set(LOCALE_COOKIE, body.locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return ok({ locale: body.locale });
});
