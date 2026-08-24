import Link from "next/link";
import { listAll } from "@/modules/cursus/service";
import { CreateCursusForm } from "@/components/forms/seuil/CreateCursusForm";

// Liste tous les cursus (brouillons compris — listAll() est réservé au Seuil).
export default async function SeuilCursusPage() {
  const cursusList = await listAll();

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <h1 className="font-heading text-2xl font-semibold text-text">Cursus</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <ul className="flex flex-col gap-3">
          {cursusList.map((cursus) => (
            <li key={cursus.id}>
              <Link
                href={`/seuil/cursus/${cursus.id}`}
                className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4 hover:border-accent sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-text">{cursus.title}</p>
                  <p className="text-xs text-text-muted">
                    {cursus.levels.length} niveau(x)
                  </p>
                </div>
                <span className="text-xs uppercase tracking-wide text-text-muted">
                  {cursus.status}
                </span>
              </Link>
            </li>
          ))}
          {cursusList.length === 0 && (
            <p className="text-text-muted">Aucun cursus créé.</p>
          )}
        </ul>
        <CreateCursusForm />
      </div>
    </main>
  );
}
