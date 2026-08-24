import { listCatalog } from "@/modules/cursus/service";
import { EnrollButton } from "@/components/forms/EnrollButton";
import { getDictionary } from "@/lib/i18n/locale";
import { localize, localizeOptional } from "@/lib/i18n/content";

// Rendu dynamique à chaque requête, sans `revalidate` : le layout parent
// (PublicHeader) lit la session via cookies() pour personnaliser la nav.
// Un `revalidate` ici figeait toute la page — header compris — dans le
// cache ISR, affichant un état de connexion périmé aux visiteurs suivants
// (bug constaté et corrigé le 23/08/2026). Le contenu du catalogue reste
// à jour car chaque requête est désormais rendue côté serveur.

export default async function CursusPage() {
  const cursusList = await listCatalog();
  const { t, locale } = await getDictionary();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
      <h1 className="font-heading text-3xl font-semibold text-text">
        {t.cursusPage.title}
      </h1>

      {cursusList.length === 0 && (
        <p className="text-text-muted">{t.cursusPage.empty}</p>
      )}

      {cursusList.map((cursus) => (
        <section
          key={cursus.id}
          className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6"
        >
          <div>
            <h2 className="font-heading text-xl font-semibold text-text">
              {localize(locale, cursus.title, cursus.titleEn)}
            </h2>
            {cursus.description && (
              <p className="mt-1 text-text-muted">
                {localizeOptional(locale, cursus.description, cursus.descriptionEn)}
              </p>
            )}
          </div>
          <ol className="flex flex-col gap-2">
            {cursus.levels.map((level) => (
              <li key={level.id} className="text-sm text-text">
                <span className="text-accent">
                  {t.cursusPage.level} {level.number}
                </span>{" "}
                — {localize(locale, level.name, level.nameEn)}
                <span className="text-text-muted">
                  {" "}
                  ({level.courses.length} {t.cursusPage.coursesUnit})
                </span>
              </li>
            ))}
          </ol>
          <EnrollButton cursusId={cursus.id} t={t.cursusPage} />
        </section>
      ))}
    </main>
  );
}
