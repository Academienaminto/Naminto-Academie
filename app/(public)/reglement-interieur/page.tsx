import { SingleDocumentPage } from "@/components/documents/SingleDocumentPage";
import { getDictionary } from "@/lib/i18n/locale";

export default async function ReglementInterieurPage() {
  const { t } = await getDictionary();
  return (
    <SingleDocumentPage
      type="REGLEMENT_INTERIEUR"
      title={t.documentsPage.reglementInterieurTitle}
      requireAcceptance
    />
  );
}
