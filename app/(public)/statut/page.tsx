import { SingleDocumentPage } from "@/components/documents/SingleDocumentPage";
import { getDictionary } from "@/lib/i18n/locale";

// Page réglementaire — délègue l'affichage à SingleDocumentPage
// (components/documents/SingleDocumentPage.tsx). Pas d'acceptation requise.
export default async function StatutPage() {
  const { t } = await getDictionary();
  return <SingleDocumentPage type="STATUT" title={t.documentsPage.statutTitle} />;
}
