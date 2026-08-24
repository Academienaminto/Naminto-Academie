import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";
import { getDictionary } from "@/lib/i18n/locale";

export default async function ResetPasswordPage() {
  const { t } = await getDictionary();

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <h1 className="font-heading text-2xl font-semibold text-text">
        {t.resetPasswordPage.title}
      </h1>
      <Suspense>
        <ResetPasswordForm t={t.resetPasswordPage} />
      </Suspense>
    </div>
  );
}
