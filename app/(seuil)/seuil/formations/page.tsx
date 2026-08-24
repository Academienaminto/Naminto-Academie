import Link from "next/link";
import { listAll } from "@/modules/formations/service";
import { CreateFormationForm } from "@/components/forms/seuil/CreateFormationForm";

// Liste toutes les formations (brouillons compris — listAll() est réservé
// au Seuil).
export default async function SeuilFormationsPage() {
  const formations = await listAll();

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <h1 className="font-heading text-2xl font-semibold text-text">Formations</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <ul className="flex flex-col gap-3">
          {formations.map((formation) => (
            <li key={formation.id}>
              <Link
                href={`/seuil/formations/${formation.id}`}
                className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4 hover:border-accent sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-text">{formation.title}</p>
                  <p className="text-xs text-text-muted">
                    {formation.parts.length} partie(s)
                  </p>
                </div>
                <span className="text-xs uppercase tracking-wide text-text-muted">
                  {formation.status}
                </span>
              </Link>
            </li>
          ))}
          {formations.length === 0 && (
            <p className="text-text-muted">Aucune formation créée.</p>
          )}
        </ul>
        <CreateFormationForm />
      </div>
    </main>
  );
}
