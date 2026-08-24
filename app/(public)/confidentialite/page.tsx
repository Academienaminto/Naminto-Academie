import { SingleDocumentPage } from "@/components/documents/SingleDocumentPage";
import { getDictionary } from "@/lib/i18n/locale";

// Page réglementaire — délègue l'affichage à SingleDocumentPage
// (components/documents/SingleDocumentPage.tsx). requireAcceptance : bouton
// d'acceptation explicite affiché aux membres connectés (RÈGLES MÉTIER §63-64).
export default async function ConfidentialitePage() {
  const { t } = await getDictionary();
  return (
    <SingleDocumentPage
      type="CONFIDENTIALITE"
      title={t.documentsPage.confidentialiteTitle}
      requireAcceptance
    />
  );
}
