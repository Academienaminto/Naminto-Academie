import { SingleDocumentPage } from "@/components/documents/SingleDocumentPage";
import { getDictionary } from "@/lib/i18n/locale";

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
