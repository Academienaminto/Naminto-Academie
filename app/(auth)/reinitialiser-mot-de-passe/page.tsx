import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";
import { getDictionary } from "@/lib/i18n/locale";

// Page de réinitialisation de mot de passe — reçoit le token depuis le lien
// envoyé par e-mail (voir app/(auth)/mot-de-passe-oublie).
export default async function ResetPasswordPage() {
  const { t } = await getDictionary();

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <h1 className="font-heading text-2xl font-semibold text-text">
        {t.resetPasswordPage.title}
      </h1>
      {/* ResetPasswordForm lit le token via useSearchParams() (composant
          client) : Next.js exige un <Suspense> autour de tout composant
          client qui appelle useSearchParams, sous peine d'erreur de build
          ("should be wrapped in a suspense boundary"). Même contrainte pour
          VerifyEmailStatus dans app/(auth)/verification-email/page.tsx. */}
      <Suspense>
        <ResetPasswordForm t={t.resetPasswordPage} />
      </Suspense>
    </div>
  );
}
