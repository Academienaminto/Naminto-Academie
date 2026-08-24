import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { MobileNav } from "@/components/navigation/MobileNav";
import { LanguageSwitcher } from "@/components/navigation/LanguageSwitcher";
import { Logo } from "@/components/navigation/Logo";
import { getDictionary } from "@/lib/i18n/locale";

// Composant serveur : entête public (Logo, nav desktop, MobileNav/
// LanguageSwitcher pour le repli mobile). Les liens visibles dépendent de
// la session (getCurrentUser) et de la locale courante (getDictionary).
export async function PublicHeader() {
  const user = await getCurrentUser();
  const { locale, t } = await getDictionary();

  return (
    <header className="relative border-b border-border">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-4 md:hidden">
          <LanguageSwitcher current={locale} t={t.language} />
          <MobileNav loggedIn={Boolean(user)} t={t.nav} />
        </div>
        <nav className="hidden items-center gap-6 text-sm text-text md:flex">
          <Link href="/cursus" className="hover:text-accent">
            {t.nav.cursus}
          </Link>
          <Link href="/formations" className="hover:text-accent">
            {t.nav.formations}
          </Link>
          <Link href="/bibliotheque" className="hover:text-accent">
            {t.nav.bibliotheque}
          </Link>
          <Link href="/blog" className="hover:text-accent">
            {t.nav.blog}
          </Link>
          <Link href="/contact" className="hover:text-accent">
            {t.nav.contact}
          </Link>
          {user ? (
            <Link href="/membre" className="hover:text-accent">
              {t.nav.monEspace}
            </Link>
          ) : (
            <>
              <Link href="/connexion" className="hover:text-accent">
                {t.nav.connexion}
              </Link>
              <Link
                href="/inscription"
                className="rounded-md bg-primary px-3 py-1.5 text-text hover:opacity-90"
              >
                {t.nav.rejoindre}
              </Link>
            </>
          )}
          <LanguageSwitcher current={locale} t={t.language} />
        </nav>
      </div>
    </header>
  );
}
