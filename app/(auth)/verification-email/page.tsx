import { Suspense } from "react";
import { VerifyEmailStatus } from "@/components/forms/VerifyEmailStatus";
import { getDictionary } from "@/lib/i18n/locale";

export default async function VerifyEmailPage() {
  const { t } = await getDictionary();

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <h1 className="font-heading text-2xl font-semibold text-text">
        {t.verifyEmailPage.title}
      </h1>
      <Suspense>
        <VerifyEmailStatus t={t.verifyEmailPage} />
      </Suspense>
    </div>
  );
}
