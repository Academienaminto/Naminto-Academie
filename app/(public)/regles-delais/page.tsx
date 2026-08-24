import { SingleDocumentPage } from "@/components/documents/SingleDocumentPage";
import { getDictionary } from "@/lib/i18n/locale";

export default async function ReglesDelaisPage() {
  const { t } = await getDictionary();
  return (
    <SingleDocumentPage type="REGLES_DES_DELAIS" title={t.documentsPage.reglesDelaisTitle} />
  );
}
