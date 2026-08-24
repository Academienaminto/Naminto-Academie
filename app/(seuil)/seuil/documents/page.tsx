import Link from "next/link";
import { listAll } from "@/modules/documents/service";
import { CreateDocumentForm } from "@/components/forms/seuil/CreateDocumentForm";
import { StatusButton } from "@/components/forms/seuil/StatusButton";

const TYPE_LABELS: Record<string, string> = {
  FAQ: "FAQ",
  CONFIDENTIALITE: "Confidentialité",
  STATUT: "Statut",
  REGLEMENT_INTERIEUR: "Règlement intérieur",
  REGLES_PEDAGOGIQUES: "Règles pédagogiques",
  REGLES_DES_DELAIS: "Règles des délais",
  REGLES_DES_SEANCES: "Règles des séances",
  MISE_EN_GARDE: "Mise en garde",
};

const CATEGORY_LABELS: Record<string, string> = {
  GENERALE: "Générale",
  CURSUS: "Cursus",
  FORMATIONS: "Formations",
  COURS: "Cours",
  PAIEMENTS: "Paiements",
  NON_APPLICABLE: "—",
};

export default async function SeuilDocumentsPage() {
  const documents = await listAll();

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <h1 className="font-heading text-2xl font-semibold text-text">
        Documents réglementaires
      </h1>
      <p className="text-sm text-text-muted">
        FAQ, confidentialité, statut, règlement intérieur, règles pédagogiques/délais/
        séances — RÈGLES MÉTIER §63. Chaque document est versionné : publier une
        nouvelle version archive l&apos;ancienne sans effacer son historique.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <ul className="flex flex-col gap-3">
          {documents.map((doc) => {
            const publishedVersions = doc.versions.filter((v) => v.status === "PUBLIE");
            return (
              <li
                key={doc.id}
                className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4"
              >
                <div className="flex items-center justify-between">
                  <Link
                    href={`/seuil/documents/${doc.id}`}
                    className="text-text hover:text-accent hover:underline"
                  >
                    {doc.title}
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wide text-text-muted">
                      {doc.status}
                    </span>
                    {doc.status === "PUBLIE" ? (
                      <StatusButton
                        endpoint={`/api/v1/documents/${doc.id}/status`}
                        status="BROUILLON"
                        label="Dépublier"
                        variant="tertiary"
                      />
                    ) : (
                      <StatusButton
                        endpoint={`/api/v1/documents/${doc.id}/status`}
                        status="PUBLIE"
                        label="Publier"
                      />
                    )}
                  </div>
                </div>
                <p className="text-xs text-text-muted">
                  {TYPE_LABELS[doc.type] ?? doc.type} — {CATEGORY_LABELS[doc.category ?? "NON_APPLICABLE"]}
                  {" — "}
                  {publishedVersions.length > 0
                    ? `${publishedVersions.length} langue(s) publiée(s)`
                    : "aucune version publiée"}
                </p>
              </li>
            );
          })}
          {documents.length === 0 && (
            <p className="text-text-muted">Aucun document créé.</p>
          )}
        </ul>
        <CreateDocumentForm />
      </div>
    </main>
  );
}
