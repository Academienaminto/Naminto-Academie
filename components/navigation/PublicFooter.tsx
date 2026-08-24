import Link from "next/link";
import { getDictionary } from "@/lib/i18n/locale";

// RÈGLES MÉTIER §57 : les visiteurs disposent d'un bouton de contact
// général (par opposition aux boutons contextuels sous les contenus,
// réservés aux membres inscrits — voir app/(membre)/membre/page.tsx).
export async function PublicFooter() {
  const { t } = await getDictionary();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 px-6 py-8 text-center text-sm text-text-muted">
        <p>{t.footer.tagline}</p>
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link href="/faq" className="hover:text-text hover:underline">
            {t.documentsPage.faqTitle}
          </Link>
          <Link href="/confidentialite" className="hover:text-text hover:underline">
            {t.documentsPage.confidentialiteTitle}
          </Link>
          <Link href="/reglement-interieur" className="hover:text-text hover:underline">
            {t.documentsPage.reglementInterieurTitle}
          </Link>
          <Link href="/statut" className="hover:text-text hover:underline">
            {t.documentsPage.statutTitle}
          </Link>
        </nav>
        <p>© {new Date().getFullYear()} Naminto Académie.</p>
      </div>
    </footer>
  );
}
