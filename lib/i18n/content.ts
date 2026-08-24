// Résolution du contenu métier bilingue (par opposition au chrome
// d'interface, qui vit dans lib/i18n/dictionaries.ts) : titres/descriptions
// de cursus, cours, formations, quiz... saisis par le Seuil en français
// avec une traduction anglaise optionnelle.
import type { Locale } from "@/lib/i18n/dictionaries";

/**
 * Résout un champ de contenu métier bilingue (titre/description de
 * cursus, cours, formation, quiz, article...) : la traduction anglaise si
 * la locale est "en" ET qu'elle existe, le français sinon. Ne devine
 * jamais un texte manquant (RÈGLE DE NON-INVENTION) — tant que le Seuil
 * n'a pas fourni la traduction d'un contenu, le français reste affiché.
 */
export function localize(
  locale: Locale,
  fr: string,
  en: string | null | undefined,
): string {
  return locale === "en" && en ? en : fr;
}

/** Variante pour un champ optionnel (description...). */
export function localizeOptional(
  locale: Locale,
  fr: string | null | undefined,
  en: string | null | undefined,
): string | null {
  if (locale === "en" && en) return en;
  return fr ?? null;
}
