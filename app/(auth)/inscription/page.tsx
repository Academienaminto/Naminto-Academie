import Link from "next/link";
import { RegisterForm } from "@/components/forms/RegisterForm";
import { getDictionary } from "@/lib/i18n/locale";

// Page d'inscription — la logique de soumission (appel API, validation,
// gestion des erreurs) vit dans le composant client RegisterForm.
export default async function RegisterPage() {
  const { t } = await getDictionary();

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <h1 className="font-heading text-2xl font-semibold text-text">
        {t.register.title}
      </h1>
      <RegisterForm t={t.register} tAuth={t.auth} />
      <p className="text-sm text-text-muted">
        {t.register.haveAccount}{" "}
        <Link href="/connexion" className="text-accent hover:underline">
          {t.register.login}
        </Link>
      </p>
    </div>
  );
}
