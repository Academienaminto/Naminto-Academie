import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { EmailButton } from "@/components/ui/EmailButton";
import { getDictionary } from "@/lib/i18n/locale";

// RÈGLES MÉTIER §57 : le Seuil doit aussi pouvoir recevoir les contacts
// généraux d'un visiteur non connecté, pas seulement les questions
// contextuelles d'un membre déjà inscrit (voir
// app/(membre)/membre/page.tsx pour ce second cas) — la messagerie interne
// (app/api/v1/conversations) exige une session, donc WhatsApp/e-mail
// restent le seul canal disponible ici.
export default async function ContactPage() {
  const { t } = await getDictionary();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-6 px-6 py-24 text-center">
      <h1 className="font-heading text-3xl font-semibold text-text">
        {t.contactPage.title}
      </h1>
      <p className="text-text-muted">{t.contactPage.intro}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <WhatsAppButton message={t.footer.whatsappMessage} label={t.footer.whatsapp} />
        <EmailButton subject={t.footer.tagline} label={t.footer.email} />
      </div>
    </main>
  );
}
