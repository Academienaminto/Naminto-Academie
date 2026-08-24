import { listCatalog } from "@/modules/books/service";
import { BookDownloadButton } from "@/components/forms/BookDownloadButton";
import { getDictionary } from "@/lib/i18n/locale";
import { localize, localizeOptional } from "@/lib/i18n/content";

// Catalogue public de la bibliothèque (livres gratuits et payants) —
// composant serveur, listCatalog() ne retourne que les livres publiés.
// Pas de `revalidate` : voir la note dans app/(public)/cursus/page.tsx —
// un cache ISR ici figerait aussi le header dépendant de la session.

export default async function BibliothequePage() {
  const books = await listCatalog();
  const { t, locale } = await getDictionary();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
      <h1 className="font-heading text-3xl font-semibold text-text">
        {t.nav.bibliotheque}
      </h1>

      {books.length === 0 && (
        <p className="text-text-muted">{t.bibliothequePage.empty}</p>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {books.map((book) => (
          <div
            key={book.id}
            className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6"
          >
            <div>
              <h2 className="font-heading text-lg font-semibold text-text">
                {localize(locale, book.title, book.titleEn)}
              </h2>
              {book.author && (
                <p className="text-sm text-text-muted">{book.author}</p>
              )}
            </div>
            {book.description && (
              <p className="text-sm text-text-muted">
                {localizeOptional(locale, book.description, book.descriptionEn)}
              </p>
            )}
            <p className="text-sm text-accent">
              {book.isFree
                ? t.bibliothequePage.free
                : `${book.price?.toString()} ${book.currency}`}
            </p>
            <BookDownloadButton
              bookId={book.id}
              productId={book.products[0]?.id}
              t={t.bibliothequePage}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
