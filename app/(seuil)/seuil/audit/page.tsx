import { listRecentAudit } from "@/lib/audit/record";

const ACTION_LABELS: Record<string, string> = {
  ACCOUNT_BLOCKED: "Compte bloqué",
  ACCOUNT_UNBLOCKED: "Compte débloqué",
  ACCOUNT_BANNED: "Compte banni",
  ACCOUNT_DELETION_REQUESTED: "Suppression de compte demandée",
  ACCOUNT_RESTORED: "Compte restauré",
  DEADLINE_RESET: "Délai réinitialisé",
  COURSE_CLOSED_FOR_DELAY: "Cours fermé (délai dépassé)",
  EVIDENCE_REVIEWED: "Preuve pratique revue",
};

// RÈGLES MÉTIER §69 : chaque opération sensible doit identifier acteur,
// action, objet, ancien état, nouvel état, date, contexte — c'est
// exactement ce que porte AuditLog, distinct du journal d'événements
// métier (§80 : HISTORY ≠ AUDIT LOG).
export default async function SeuilAuditPage() {
  const entries = await listRecentAudit(200);

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <h1 className="font-heading text-2xl font-semibold text-text">Audit</h1>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Acteur</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Objet</th>
              <th className="px-4 py-3">Ancien état</th>
              <th className="px-4 py-3">Nouvel état</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-t border-border">
                <td className="px-4 py-3 text-text-muted">
                  {new Date(entry.createdAt).toLocaleString("fr-FR")}
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {entry.actorType}
                  {entry.actorType === "SEUIL" ? ` (${entry.actorId})` : ""}
                </td>
                <td className="px-4 py-3 text-text">
                  {ACTION_LABELS[entry.action] ?? entry.action}
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {entry.entityType} · {entry.entityId}
                </td>
                <td className="px-4 py-3 text-xs text-text-muted">
                  {entry.oldValue ? JSON.stringify(entry.oldValue) : "—"}
                </td>
                <td className="px-4 py-3 text-xs text-text-muted">
                  {entry.newValue ? JSON.stringify(entry.newValue) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && (
          <p className="p-4 text-text-muted">Aucune opération sensible enregistrée.</p>
        )}
      </div>
    </main>
  );
}
