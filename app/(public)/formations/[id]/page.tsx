import { notFound } from "next/navigation";
import { AppError } from "@/lib/errors";
import { getFormation } from "@/modules/formations/service";
import { EnrollFormationButton } from "@/components/forms/EnrollFormationButton";
import { getDictionary } from "@/lib/i18n/locale";
import { localize, localizeOptional } from "@/lib/i18n/content";

export default async function FormationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let formation;
  try {
    formation = await getFormation(id);
  } catch (err) {
    if (err instanceof AppError && err.code === "RESOURCE_NOT_FOUND") {
      notFound();
    }
    throw err;
  }

  const isFree = formation.price === null || Number(formation.price) === 0;
  const { t, locale } = await getDictionary();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="font-heading text-3xl font-semibold text-text">
          {localize(locale, formation.title, formation.titleEn)}
        </h1>
        <p className="mt-2 text-sm text-accent">
          {isFree
            ? t.formationDetail.free
            : `${formation.price?.toString()} ${formation.currency}`}
        </p>
        {formation.description && (
          <p className="mt-4 text-text-muted">
            {localizeOptional(locale, formation.description, formation.descriptionEn)}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {formation.parts.map((part) => (
          <section
            key={part.id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4"
          >
            <h2 className="font-heading text-lg font-semibold text-text">
              {localize(locale, part.title, part.titleEn)}
            </h2>
            <ul className="flex flex-col gap-1 pl-4">
              {part.courses.map((course) => (
                <li key={course.id} className="text-sm text-text">
                  {course.position}. {localize(locale, course.title, course.titleEn)}
                </li>
              ))}
            </ul>
          </section>
        ))}
        {formation.parts.length === 0 && (
          <p className="text-text-muted">{t.formationDetail.comingSoon}</p>
        )}
      </div>

      <EnrollFormationButton formationId={formation.id} t={t.formationDetail} />
    </main>
  );
}
