import { listPendingEvidence } from "@/modules/quiz/service";
import { ReviewEvidenceForm } from "@/components/forms/seuil/ReviewEvidenceForm";
import { ViewFileButton } from "@/components/forms/seuil/ViewFileButton";

export default async function SeuilEvidencePage() {
  const evidenceList = await listPendingEvidence();

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <h1 className="font-heading text-2xl font-semibold text-text">
        Preuves pratiques à revoir
      </h1>

      <ul className="flex flex-col gap-4">
        {evidenceList.map((evidence) => {
          const fullName = [
            evidence.user.profile?.firstName,
            evidence.user.profile?.lastName,
          ]
            .filter(Boolean)
            .join(" ");
          const name =
            evidence.user.profile?.displayName || fullName || evidence.user.email;

          return (
            <li
              key={evidence.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4"
            >
              <div>
                <p className="text-text">{name}</p>
                <p className="text-sm text-text-muted">{evidence.question.question}</p>
                <p className="text-xs text-text-muted">
                  Soumis le {new Date(evidence.submittedAt).toLocaleString("fr-FR")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {evidence.files.map((ef) => (
                  <ViewFileButton
                    key={ef.id}
                    fileId={ef.fileId}
                    label={ef.file.name}
                  />
                ))}
              </div>
              <ReviewEvidenceForm evidenceId={evidence.id} />
            </li>
          );
        })}
        {evidenceList.length === 0 && (
          <p className="text-text-muted">Aucune preuve en attente de revue.</p>
        )}
      </ul>
    </main>
  );
}
