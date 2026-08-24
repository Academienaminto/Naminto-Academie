import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { LanguageSwitcher } from "@/components/navigation/LanguageSwitcher";
import { getDictionary } from "@/lib/i18n/locale";

// Vérification d'authentification faite ici, côté serveur, à chaque
// navigation dans l'espace membre — jamais côté client (PROMPT MASTER
// AUTHENTIFICATION §23 SÉCURITÉ FRONTEND / §40 SÉCURITÉ FRONTEND : le
// frontend ne doit jamais être considéré comme fiable).
export default async function MembreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/connexion");
  }
  const { locale, t } = await getDictionary();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-2xl justify-end px-6 pt-4">
        <LanguageSwitcher current={locale} t={t.language} />
      </div>
      {children}
    </div>
  );
}
