import Link from "next/link";
import { listCatalog } from "@/modules/formations/service";
import { getDictionary } from "@/lib/i18n/locale";
import { localize, localizeOptional } from "@/lib/i18n/content";

// Catalogue public des formations — composant serveur.
// Pas de `revalidate` : voir la note dans app/(public)/cursus/page.tsx —
// un cache ISR ici figerait aussi le header dépendant de la session.

export default async function FormationsPage() {
  const formations = await listCatalog();
  const { t, locale } = await getDictionary();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
      <h1 className="font-heading text-3xl font-semibold text-text">
        {t.nav.formations}
      </h1>

      {formations.length === 0 && (
        <p className="text-text-muted">{t.formationsPage.empty}</p>
      )}

      {formations.map((formation) => {
        const totalCourses = formation.parts.reduce(
          (sum, part) => sum + part.courses.length,
          0,
        );
        const isFree = formation.price === null || Number(formation.price) === 0;

        return (
          <Link
            key={formation.id}
            href={`/formations/${formation.id}`}
            className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6 hover:border-accent"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold text-text">
                {localize(locale, formation.title, formation.titleEn)}
              </h2>
              <span className="text-sm text-accent">
                {isFree
                  ? t.formationsPage.free
                  : `${formation.price?.toString()} ${formation.currency}`}
              </span>
            </div>
            {formation.description && (
              <p className="text-text-muted">
                {localizeOptional(locale, formation.description, formation.descriptionEn)}
              </p>
            )}
            <p className="text-sm text-text-muted">
              {formation.parts.length} {t.formationsPage.partsUnit} —{" "}
              {totalCourses} {t.formationsPage.coursesUnit}
            </p>
          </Link>
        );
      })}
    </main>
  );
}
