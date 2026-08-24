import { notFound } from "next/navigation";
import { AppError } from "@/lib/errors";
import { getDocument } from "@/modules/documents/service";
import { AddDocumentVersionForm } from "@/components/forms/seuil/AddDocumentVersionForm";
import { StatusButton } from "@/components/forms/seuil/StatusButton";

const LANGUAGE_LABELS: Record<string, string> = { fr: "Français", en: "English" };

// Fiche d'un document réglementaire : liste ses versions (par langue).
// Contrairement à getBook/getCursus/getCourse/getFormation, getDocument
// n'a pas de paramètre canManageAll — un document n'a pas de statut caché
// aux visiteurs de la même façon (voir modules/documents/service.ts) ; il
// n'y a donc rien à distinguer ici entre lecture publique et lecture Seuil.
export default async function SeuilDocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let document;
  try {
    document = await getDocument(id);
  } catch (err) {
    // AppError RESOURCE_NOT_FOUND -> 404 Next.js.
    if (err instanceof AppError && err.code === "RESOURCE_NOT_FOUND") {
      notFound();
    }
    throw err;
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-text">{document.title}</h1>
        {document.description && (
          <p className="text-sm text-text-muted">{document.description}</p>
        )}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold text-text">Versions</h2>
        {document.versions.map((version) => (
          <div
            key={version.id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-text">
                v{version.versionNumber} — {LANGUAGE_LABELS[version.language] ?? version.language}
                {" — "}
                <span className="uppercase tracking-wide text-text-muted">
                  {version.status}
                </span>
              </p>
              {version.status !== "PUBLIE" && (
                <StatusButton
                  endpoint={`/api/v1/documents/versions/${version.id}/status`}
                  status="PUBLIE"
                  label="Publier cette version"
                />
              )}
            </div>
            <p className="whitespace-pre-wrap text-sm text-text-muted">
              {version.content.length > 300
                ? `${version.content.slice(0, 300)}…`
                : version.content}
            </p>
          </div>
        ))}
        {document.versions.length === 0 && (
          <p className="text-text-muted">Aucune version pour le moment.</p>
        )}
      </section>

      <AddDocumentVersionForm documentId={document.id} />
    </main>
  );
}
