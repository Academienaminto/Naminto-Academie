import { Suspense } from "react";
import { VerifyEmailStatus } from "@/components/forms/VerifyEmailStatus";
import { getDictionary } from "@/lib/i18n/locale";

// Page de vérification d'e-mail — reçoit le token depuis le lien envoyé à
// l'inscription (voir app/(auth)/inscription).
export default async function VerifyEmailPage() {
  const { t } = await getDictionary();

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <h1 className="font-heading text-2xl font-semibold text-text">
        {t.verifyEmailPage.title}
      </h1>
      {/* VerifyEmailStatus lit le token via useSearchParams() (composant
          client) : Next.js exige un <Suspense> autour de tout composant
          client qui appelle useSearchParams, sous peine d'erreur de build
          ("should be wrapped in a suspense boundary"). Même contrainte pour
          ResetPasswordForm dans app/(auth)/reinitialiser-mot-de-passe/page.tsx. */}
      <Suspense>
        <VerifyEmailStatus t={t.verifyEmailPage} />
      </Suspense>
    </div>
  );
}
