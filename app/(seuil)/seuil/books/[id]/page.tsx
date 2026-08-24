import { notFound } from "next/navigation";
import { AppError } from "@/lib/errors";
import { getBook } from "@/modules/books/service";
import { AddBookVersionForm } from "@/components/forms/seuil/AddBookVersionForm";
import { StatusButton } from "@/components/forms/seuil/StatusButton";

export default async function SeuilBookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let book;
  try {
    book = await getBook(id, true); // page Seuil : doit voir les brouillons
  } catch (err) {
    if (err instanceof AppError && err.code === "RESOURCE_NOT_FOUND") {
      notFound();
    }
    throw err;
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text">
            {book.title}
          </h1>
          <p className="text-sm text-text-muted">
            {book.status} —{" "}
            {book.isFree ? "gratuit" : `${book.price?.toString()} ${book.currency}`}
          </p>
        </div>
        {book.status === "PUBLIE" ? (
          <StatusButton
            endpoint={`/api/v1/books/${book.id}/status`}
            status="DEPUBLIE"
            label="Dépublier"
            variant="tertiary"
          />
        ) : (
          <StatusButton
            endpoint={`/api/v1/books/${book.id}/status`}
            status="PUBLIE"
            label="Publier"
          />
        )}
      </div>

      <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6">
        <h2 className="font-heading text-lg font-semibold text-text">Versions</h2>
        <ul className="flex flex-col gap-2">
          {book.versions.map((version) => (
            <li
              key={version.id}
              className="flex items-center justify-between rounded-md border border-border p-3 text-sm text-text"
            >
              <span>Version {version.versionNumber}</span>
              <span className="text-xs text-text-muted">{version.fileId}</span>
            </li>
          ))}
          {book.versions.length === 0 && (
            <p className="text-text-muted">Aucune version ajoutée.</p>
          )}
        </ul>
      </section>

      <AddBookVersionForm bookId={book.id} />
    </main>
  );
}
