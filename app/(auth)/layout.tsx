import Link from "next/link";
import { LanguageSwitcher } from "@/components/navigation/LanguageSwitcher";
import { Logo } from "@/components/navigation/Logo";
import { getDictionary } from "@/lib/i18n/locale";

// Layout du groupe de routes (auth) — logo + sélecteur de langue centrés
// au-dessus du formulaire, sans PublicHeader/PublicFooter (pages de
// connexion/inscription/mot de passe volontairement isolées de la nav
// publique).
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale, t } = await getDictionary();

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="flex w-full max-w-sm items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>
        <LanguageSwitcher current={locale} t={t.language} />
      </div>
      {children}
    </div>
  );
}
