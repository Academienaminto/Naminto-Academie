import { getPublishedFaqByCategory } from "@/modules/documents/service";
import { getDictionary } from "@/lib/i18n/locale";

// FAQ publique — regroupe plusieurs catégories de documents FAQ publiés sur
// une seule page (contrairement aux autres pages réglementaires qui
// utilisent SingleDocumentPage pour un seul document, voir
// components/documents/SingleDocumentPage.tsx). Les libellés de catégorie
// ne viennent pas du dictionnaire i18n (lib/i18n) : ils sont codés en dur
// ici faute d'entrées dédiées dans les dictionnaires fr/en.
const CATEGORY_LABELS_FR: Record<string, string> = {
  GENERALE: "Générale",
  CURSUS: "Cursus",
  FORMATIONS: "Formations",
  COURS: "Cours",
  PAIEMENTS: "Paiements",
};
const CATEGORY_LABELS_EN: Record<string, string> = {
  GENERALE: "General",
  CURSUS: "Curriculum",
  FORMATIONS: "Courses",
  COURS: "Course",
  PAIEMENTS: "Payments",
};

export default async function FaqPage() {
  const { t, locale } = await getDictionary();
  const documents = await getPublishedFaqByCategory();
  const labels = locale === "en" ? CATEGORY_LABELS_EN : CATEGORY_LABELS_FR;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-16">
      <h1 className="font-heading text-3xl font-semibold text-text">
        {t.documentsPage.faqTitle}
      </h1>

      {documents.length === 0 && <p className="text-text-muted">{t.documentsPage.empty}</p>}

      {documents.map((doc) => {
        const frVersion = doc.versions.find((v) => v.language === "fr");
        const enVersion = doc.versions.find((v) => v.language === "en");
        const version = locale === "en" && enVersion ? enVersion : frVersion;
        if (!version) return null;

        return (
          <section key={doc.id} className="flex flex-col gap-3">
            <h2 className="font-heading text-xl font-semibold text-accent">
              {labels[doc.category ?? "GENERALE"] ?? doc.category}
            </h2>
            <div className="whitespace-pre-wrap text-text">{version.content}</div>
          </section>
        );
      })}
    </main>
  );
}
