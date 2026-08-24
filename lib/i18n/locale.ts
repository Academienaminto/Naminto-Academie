import { cookies } from "next/headers";
import { DEFAULT_LOCALE, dictionaries, type Locale } from "@/lib/i18n/dictionaries";

// PROMPT MASTER INTERNATIONALISATION §2-3 : langue par défaut explicite
// (français), choix conservé selon un mécanisme officiel (cookie, distinct
// du cookie de session — changer de langue ne doit jamais toucher à
// l'authentification, §55 SÉCURITÉ). Ne modifie ni compte ni permissions.
export const LOCALE_COOKIE = "naminto_locale";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return value === "en" ? "en" : DEFAULT_LOCALE;
}

export async function getDictionary() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}
