import Link from "next/link";
import { listAll } from "@/modules/books/service";
import { CreateBookForm } from "@/components/forms/seuil/CreateBookForm";

export default async function SeuilBooksPage() {
  const books = await listAll();

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <h1 className="font-heading text-2xl font-semibold text-text">Bibliothèque</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <ul className="flex flex-col gap-3">
          {books.map((book) => (
            <li key={book.id}>
              <Link
                href={`/seuil/books/${book.id}`}
                className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4 hover:border-accent sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-text">{book.title}</p>
                  <p className="text-xs text-text-muted">
                    {book.isFree ? "Gratuit" : `${book.price?.toString()} ${book.currency}`}
                  </p>
                </div>
                <span className="text-xs uppercase tracking-wide text-text-muted">
                  {book.status}
                </span>
              </Link>
            </li>
          ))}
          {books.length === 0 && <p className="text-text-muted">Aucun livre créé.</p>}
        </ul>
        <CreateBookForm />
      </div>
    </main>
  );
}
