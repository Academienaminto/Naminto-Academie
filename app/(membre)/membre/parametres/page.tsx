import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreference } from "@/modules/notifications/service";
import { getDictionary } from "@/lib/i18n/locale";
import { SettingsForm } from "@/components/forms/SettingsForm";

export default async function ParametresPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/connexion");
  }
  const preference = await getPreference(user.id);
  const { t } = await getDictionary();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-text">
          {t.settings.title}
        </h1>
        <Link href="/membre" className="text-sm text-text-muted hover:text-accent">
          {t.settings.back}
        </Link>
      </div>
      <SettingsForm
        initialEnabled={preference?.enabled ?? true}
        initialSoundEnabled={preference?.soundEnabled ?? true}
        t={t.settings}
      />
    </main>
  );
}
