import { listAll } from "@/modules/deadlines/service";
import { ActionButton } from "@/components/forms/seuil/ActionButton";

const STATUS_LABELS: Record<string, string> = {
  EN_COURS: "En cours",
  FERME: "Fermé",
};

// Liste tous les délais actifs/fermés (voir modules/deadlines/service.ts
// pour le mécanisme des 3 alertes). "Réinitialiser" (ActionButton) remet le
// délai à zéro sans perdre l'historique des alertes déjà envoyées.
export default async function SeuilDeadlinesPage() {
  const deadlines = await listAll();

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <h1 className="font-heading text-2xl font-semibold text-text">Délais</h1>

      <ul className="flex flex-col gap-3">
        {deadlines.map((deadline) => {
          const name =
            deadline.user.profile?.displayName ||
            [deadline.user.profile?.firstName, deadline.user.profile?.lastName]
              .filter(Boolean)
              .join(" ") ||
            deadline.user.email;

          return (
            <li
              key={deadline.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-text">
                  {name} — {deadline.course.title}
                </p>
                <p className="text-xs text-text-muted">
                  Échéance : {new Date(deadline.dueAt).toLocaleDateString("fr-FR")}
                  {deadline.warning1At && " — Alerte 1 envoyée"}
                  {deadline.warning2At && " — Alerte 2 envoyée"}
                  {deadline.warning3At && " — Alerte 3 / fermé"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wide text-text-muted">
                  {STATUS_LABELS[deadline.status] ?? deadline.status}
                </span>
                {deadline.status === "EN_COURS" && (
                  <ActionButton
                    endpoint={`/api/v1/deadlines/${deadline.id}/reset`}
                    method="POST"
                    label="Réinitialiser"
                  />
                )}
              </div>
            </li>
          );
        })}
        {deadlines.length === 0 && (
          <p className="text-text-muted">Aucun délai en cours.</p>
        )}
      </ul>
    </main>
  );
}
