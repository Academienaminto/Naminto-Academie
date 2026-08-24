import { SingleDocumentPage } from "@/components/documents/SingleDocumentPage";
import { getDictionary } from "@/lib/i18n/locale";

export default async function StatutPage() {
  const { t } = await getDictionary();
  return <SingleDocumentPage type="STATUT" title={t.documentsPage.statutTitle} />;
}
