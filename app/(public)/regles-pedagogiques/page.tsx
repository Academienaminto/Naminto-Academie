import { SingleDocumentPage } from "@/components/documents/SingleDocumentPage";
import { getDictionary } from "@/lib/i18n/locale";

export default async function ReglesPedagogiquesPage() {
  const { t } = await getDictionary();
  return (
    <SingleDocumentPage
      type="REGLES_PEDAGOGIQUES"
      title={t.documentsPage.reglesPedagogiquesTitle}
    />
  );
}
