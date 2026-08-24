import { notFound } from "next/navigation";
import Link from "next/link";
import { AppError } from "@/lib/errors";
import { getCursus } from "@/modules/cursus/service";
import { AddLevelForm } from "@/components/forms/seuil/AddLevelForm";
import { AddCourseForm } from "@/components/forms/seuil/AddCourseForm";
import { StatusButton } from "@/components/forms/seuil/StatusButton";

export default async function SeuilCursusDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let cursus;
  try {
    cursus = await getCursus(id, true); // page Seuil : doit voir les brouillons
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
            {cursus.title}
          </h1>
          <p className="text-sm text-text-muted">{cursus.status}</p>
        </div>
        {cursus.status === "PUBLIE" ? (
          <StatusButton
            endpoint={`/api/v1/cursus/${cursus.id}`}
            status="DEPUBLIE"
            label="Dépublier"
            variant="tertiary"
          />
        ) : (
          <StatusButton
            endpoint={`/api/v1/cursus/${cursus.id}`}
            status="PUBLIE"
            label="Publier"
          />
        )}
      </div>

      <div className="flex flex-col gap-6">
        {cursus.levels.map((level) => (
          <section
            key={level.id}
            className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6"
          >
            <h2 className="font-heading text-lg font-semibold text-text">
              Niveau {level.number} — {level.name}
            </h2>
            <ul className="flex flex-col gap-2">
              {level.courses.map((course) => (
                <li
                  key={course.id}
                  className="flex items-center justify-between rounded-md border border-border p-3 text-sm"
                >
                  <span className="text-text">
                    {course.position}. {course.title}{" "}
                    {course.price
                      ? `— ${course.price.toString()} ${course.currency}`
                      : "— gratuit"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wide text-text-muted">
                      {course.status}
                    </span>
                    <Link
                      href={`/seuil/courses/${course.id}/material`}
                      className="rounded-md border border-border px-3 py-1.5 text-sm text-text hover:bg-background"
                    >
                      Matériel
                    </Link>
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
            <AddCourseForm levelId={level.id} />
          </section>
        ))}
      </div>

      <AddLevelForm cursusId={cursus.id} />
    </main>
  );
}
