import Link from "next/link";
import { LoginForm } from "@/components/forms/LoginForm";
import { getDictionary } from "@/lib/i18n/locale";

export default async function LoginPage() {
  const { t } = await getDictionary();

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <h1 className="font-heading text-2xl font-semibold text-text">
        {t.auth.loginTitle}
      </h1>
      <LoginForm t={t.auth} />
      <p className="text-sm text-text-muted">
        {t.auth.noAccount}{" "}
        <Link href="/inscription" className="text-accent hover:underline">
          {t.auth.createAccount}
        </Link>
      </p>
    </div>
  );
}
