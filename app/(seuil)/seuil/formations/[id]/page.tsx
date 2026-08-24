import { notFound } from "next/navigation";
import Link from "next/link";
import { AppError } from "@/lib/errors";
import { getFormation } from "@/modules/formations/service";
import { AddFormationPartForm } from "@/components/forms/seuil/AddFormationPartForm";
import { AddFormationCourseForm } from "@/components/forms/seuil/AddFormationCourseForm";
import { StatusButton } from "@/components/forms/seuil/StatusButton";

// Rappel (voir modules/progress/service.ts advanceFormationEligibility) :
// ne publier une partie/la formation qu'une fois tout son contenu ajouté —
// le statut PUBLIÉ fait foi que le contenu est éditorialement complet.
//
// Fiche d'une formation : parties et cours imbriqués, chacun publiable
// indépendamment (StatusButton par partie/cours en plus de celui de la
// formation).
export default async function SeuilFormationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let formation;
  try {
    // canManageAll=true (voir modules/formations/service.ts getFormation) :
    // le Seuil doit voir une formation encore en brouillon.
    formation = await getFormation(id, true); // page Seuil : doit voir les brouillons
  } catch (err) {
    // AppError RESOURCE_NOT_FOUND -> 404 Next.js.
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
            {formation.title}
          </h1>
          <p className="text-sm text-text-muted">
            {formation.status} —{" "}
            {formation.price
              ? `${formation.price.toString()} ${formation.currency}`
              : "gratuite"}
          </p>
        </div>
        {formation.status === "PUBLIE" ? (
          <StatusButton
            endpoint={`/api/v1/formations/${formation.id}/status`}
            status="DEPUBLIE"
            label="Dépublier"
            variant="tertiary"
          />
        ) : (
          <StatusButton
            endpoint={`/api/v1/formations/${formation.id}/status`}
            status="PUBLIE"
            label="Publier"
          />
        )}
      </div>

      <div className="flex flex-col gap-6">
        {formation.parts.map((part) => (
          <section
            key={part.id}
            className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-heading text-lg font-semibold text-text">
                Partie {part.position} — {part.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-wide text-text-muted">
                  {part.status}
                </span>
                {part.status === "PUBLIE" ? (
                  <StatusButton
                    endpoint={`/api/v1/formation-parts/${part.id}/status`}
                    status="DEPUBLIE"
                    label="Dépublier"
                    variant="tertiary"
                  />
                ) : (
                  <StatusButton
                    endpoint={`/api/v1/formation-parts/${part.id}/status`}
                    status="PUBLIE"
                    label="Publier"
                    variant="secondary"
                  />
                )}
              </div>
            </div>
            <ul className="flex flex-col gap-2">
              {part.courses.map((course) => (
                <li
                  key={course.id}
                  className="flex items-center justify-between rounded-md border border-border p-3 text-sm"
                >
                  <span className="text-text">
                    {course.position}. {course.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wide text-text-muted">
                      {course.status}
                    </span>
                    <Link
                      href={`/seuil/courses/${course.id}/quiz`}
                      className="rounded-md border border-border px-3 py-1.5 text-sm text-text hover:bg-background"
                    >
                      Quiz
                    </Link>
                    {course.status === "PUBLIE" ? (
                      <StatusButton
                        endpoint={`/api/v1/courses/${course.id}/status`}
                        status="DEPUBLIE"
                        label="Dépublier"
                        variant="tertiary"
                      />
                    ) : (
                      <StatusButton
                        endpoint={`/api/v1/courses/${course.id}/status`}
                        status="PUBLIE"
                        label="Publier"
                        variant="secondary"
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <AddFormationCourseForm formationPartId={part.id} />
          </section>
        ))}
      </div>

      <AddFormationPartForm formationId={formation.id} />
    </main>
  );
}
