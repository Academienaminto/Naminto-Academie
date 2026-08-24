import { SingleDocumentPage } from "@/components/documents/SingleDocumentPage";
import { getDictionary } from "@/lib/i18n/locale";

// Page réglementaire — délègue l'affichage à SingleDocumentPage
// (components/documents/SingleDocumentPage.tsx). Pas d'acceptation requise.
export default async function ReglesSeancesPage() {
  const { t } = await getDictionary();
  return (
    <SingleDocumentPage type="REGLES_DES_SEANCES" title={t.documentsPage.reglesSeancesTitle} />
  );
}
