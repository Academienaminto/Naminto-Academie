import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";
import { getDictionary } from "@/lib/i18n/locale";

// Page de demande de réinitialisation de mot de passe — envoie le lien de
// réinitialisation par e-mail ; la logique vit dans ForgotPasswordForm
// (composant client). Suite du parcours : app/(auth)/reinitialiser-mot-de-passe.
export default async function ForgotPasswordPage() {
  const { t } = await getDictionary();

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <h1 className="font-heading text-2xl font-semibold text-text">
        {t.forgotPasswordPage.title}
      </h1>
      <ForgotPasswordForm t={t.forgotPasswordPage} />
      <Link href="/connexion" className="text-sm text-accent hover:underline">
        {t.forgotPasswordPage.backToLogin}
      </Link>
    </div>
  );
}
