import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { getDictionary } from "@/lib/i18n/locale";

// Page d'accueil publique — composant serveur, contenu statique (dictionnaire
// i18n uniquement, aucun accès base de données) hormis le carrousel hero.
export default async function HomePage() {
  const { t } = await getDictionary();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-12 px-6 py-24 text-center">
      <div className="flex flex-col items-center gap-6">
        <h1 className="font-heading text-4xl font-semibold text-text sm:text-5xl">
          {t.home.titleLine1}
          <br />
          {t.home.titleLine2}
        </h1>
        <p className="max-w-xl text-text-muted">{t.home.subtitle}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/cursus">
            <Button>{t.home.ctaDiscover}</Button>
          </Link>
          <Link href="/inscription">
            <Button variant="tertiary">{t.home.ctaCreateAccount}</Button>
          </Link>
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-6">
        <HeroCarousel />
        <Link href="/univers">
          <Button variant="secondary">{t.home.ctaEnterUniverse}</Button>
        </Link>
      </div>
    </main>
  );
}
