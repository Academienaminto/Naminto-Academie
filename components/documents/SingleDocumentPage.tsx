import { getCurrentUser } from "@/lib/auth/session";
import { getPublishedByTypeAndCategory, getMyAcceptance } from "@/modules/documents/service";
import { getDictionary } from "@/lib/i18n/locale";
import { AcceptDocumentButton } from "@/components/forms/AcceptDocumentButton";

// RÈGLES MÉTIER §63-64 : chaque document réglementaire (hors FAQ, qui
// regroupe plusieurs catégories sur une seule page — voir app/(public)/faq)
// suit la même structure d'affichage : titre, contenu de la version
// publiée dans la langue courante (repli français si l'anglais n'existe
// pas encore), date de dernière mise à jour, et — pour le règlement
// intérieur et la politique de confidentialité — un bouton d'acceptation
// explicite. L'acceptation n'est jamais obligatoire à l'inscription :
// aucune règle métier ne l'impose (voir modules/documents/service.ts).
export async function SingleDocumentPage({
  type,
  title,
  requireAcceptance = false,
}: {
  type: string;
  title: string;
  requireAcceptance?: boolean;
}) {
  const { t, locale } = await getDictionary();
  const document = await getPublishedByTypeAndCategory(type, "NON_APPLICABLE");
  const user = await getCurrentUser();

  const frVersion = document?.versions.find((v) => v.language === "fr");
  const enVersion = document?.versions.find((v) => v.language === "en");
  const version = locale === "en" && enVersion ? enVersion : frVersion;

  let alreadyAccepted = false;
  if (requireAcceptance && user && version) {
    const acceptance = await getMyAcceptance(version.id, user.id);
    alreadyAccepted = !!acceptance;
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="font-heading text-3xl font-semibold text-text">{title}</h1>
      {version ? (
        <>
          <div className="whitespace-pre-wrap text-text">{version.content}</div>
          <p className="text-xs text-text-muted">
            {t.documentsPage.lastUpdated}{" "}
            {new Date(version.effectiveAt ?? version.createdAt).toLocaleDateString(
              locale === "en" ? "en-US" : "fr-FR",
            )}
          </p>
          {requireAcceptance && user && (
            <AcceptDocumentButton
              versionId={version.id}
              alreadyAccepted={alreadyAccepted}
              t={t.documentsPage}
            />
          )}
        </>
      ) : (
        <p className="text-text-muted">{t.documentsPage.empty}</p>
      )}
    </main>
  );
}
