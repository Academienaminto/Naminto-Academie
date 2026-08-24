import { notFound } from "next/navigation";
import Link from "next/link";
import { AppError } from "@/lib/errors";
import { getCourseSummary } from "@/modules/progress/service";
import { getCourse } from "@/modules/cursus/service";
import { UploadCourseFileForm } from "@/components/forms/seuil/UploadCourseFileForm";
import { ViewFileButton } from "@/components/forms/seuil/ViewFileButton";

export default async function SeuilCourseMaterialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let course;
  try {
    course = await getCourseSummary(id);
  } catch (err) {
    if (err instanceof AppError && err.code === "RESOURCE_NOT_FOUND") {
      notFound();
    }
    throw err;
  }

  const { versions } = await getCourse(id, true); // page Seuil : doit voir les brouillons

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-text">
          Matériel — {course.title}
        </h1>
        <p className="text-sm text-text-muted">
          Le fichier le plus récent est celui proposé au téléchargement aux membres ayant
          accès à ce cours.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {versions.length === 0 && (
          <p className="text-text-muted">Aucun fichier envoyé pour ce cours.</p>
        )}
        {versions.map((version) => (
          <div
            key={version.id}
            className="flex items-center justify-between rounded-md border border-border p-3 text-sm"
          >
            <span className="text-text">
              Version {version.versionNumber} —{" "}
              {new Date(version.createdAt).toLocaleDateString("fr-FR")}
            </span>
            {version.fileId && <ViewFileButton fileId={version.fileId} label="Voir" />}
          </div>
        ))}
      </div>

      <UploadCourseFileForm courseId={id} />

      <Link href={`/seuil/cursus`} className="text-sm text-accent hover:underline">
        ← Retour au cursus
      </Link>
    </main>
  );
}
