import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { userHasRole } from "@/lib/auth/permissions";
import { LogoutButton } from "@/components/forms/LogoutButton";
import { MembreMobileNav } from "@/components/navigation/MembreMobileNav";
import { CourseStateBadge } from "@/components/ui/CourseStateBadge";
import { PurchaseButton } from "@/components/forms/PurchaseButton";
import { listMine } from "@/modules/enrollment/service";
import {
  getCourseAccessState,
  type CourseAccessState,
} from "@/modules/progress/service";
import { listMine as listMyNotifications } from "@/modules/notifications/service";
import { listMineForCourse } from "@/modules/sessions/service";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { EmailButton } from "@/components/ui/EmailButton";
import { getDictionary } from "@/lib/i18n/locale";
import { localize } from "@/lib/i18n/content";
import { NotificationList } from "@/components/forms/NotificationList";

export default async function MembreHomePage() {
  // Le layout parent garantit déjà qu'un utilisateur est connecté ;
  // on relit ici l'identité pour l'affichage (jamais pour l'autorisation).
  const user = await getCurrentUser();
  const enrollments = user ? await listMine(user.id) : [];
  const notifications = user ? await listMyNotifications(user.id) : [];
  const isSeuil = user ? await userHasRole(user.id, "SEUIL") : false;
  const { t, locale } = await getDictionary();

  // Les états d'accès sont précalculés ici (pas dans le JSX) pour rester
  // dans un rendu synchrone : plus simple à lire, une seule vague de
  // requêtes en parallèle plutôt que des awaits imbriqués dans les .map().
  const courseIds = enrollments.flatMap((e) => [
    ...(e.cursus ? e.cursus.levels.flatMap((l) => l.courses.map((c) => c.id)) : []),
    ...(e.formation ? e.formation.parts.flatMap((p) => p.courses.map((c) => c.id)) : []),
  ]);
  const states: Record<string, CourseAccessState> = {};
  if (user) {
    await Promise.all(
      courseIds.map(async (courseId) => {
        states[courseId] = await getCourseAccessState(user.id, courseId);
      }),
    );
  }

  // Séances (RÈGLES MÉTIER §21) : 3 par cours pour le cursus, 3 par PARTIE
  // pour une formation (partagées entre les cours de cette partie). On ne
  // les récupère que pour un cours déjà activé (ACCESSIBLE au moins une
  // fois) — pas de requête inutile pour un cours verrouillé ou à acheter.
  // Le résultat est indexé par cours pour rester simple à consommer dans
  // le rendu (les cours d'une même partie de formation partagent la même
  // valeur, listMineForCourse résolvant déjà le bon regroupement).
  const sessionsRemainingByCourse: Record<string, number> = {};
  if (user) {
    await Promise.all(
      courseIds
        .filter((id) => states[id] === "ACCESSIBLE" || states[id] === "CLOSED_FOR_DELAY")
        .map(async (courseId) => {
          const list = await listMineForCourse(user.id, courseId);
          sessionsRemainingByCourse[courseId] = list.filter(
            (s) => s.status === "DISPONIBLE",
          ).length;
        }),
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-heading text-sm uppercase tracking-[0.3em] text-accent">
            {t.membrePage.space}
          </p>
          <h1 className="font-heading text-3xl font-semibold text-text">
            {t.membrePage.greeting}
            {user?.profile?.firstName ? `, ${user.profile.firstName}` : ""}
          </h1>
        </div>
        <div className="hidden flex-wrap items-center gap-3 md:flex">
          <Link href="/cursus" className="text-sm text-text hover:text-accent">
            {t.nav.cursus}
          </Link>
          <Link href="/formations" className="text-sm text-text hover:text-accent">
            {t.nav.formations}
          </Link>
          <Link href="/bibliotheque" className="text-sm text-text hover:text-accent">
            {t.nav.bibliotheque}
          </Link>
          <Link href="/blog" className="text-sm text-text hover:text-accent">
            {t.nav.blog}
          </Link>
          <Link href="/membre/rendez-vous" className="text-sm text-text hover:text-accent">
            {t.nav.rendezVous}
          </Link>
          <Link href="/membre/messages" className="text-sm text-text hover:text-accent">
            {t.nav.messages}
          </Link>
          <Link href="/membre/parametres" className="text-sm text-text hover:text-accent">
            {t.nav.parametres}
          </Link>
          {isSeuil && (
            <Link
              href="/seuil"
              className="text-sm text-accent hover:underline"
            >
              {t.nav.leSeuil}
            </Link>
          )}
          <LogoutButton label={t.nav.deconnexion} />
        </div>
        <div className="flex justify-end md:hidden">
          <MembreMobileNav t={t.nav} isSeuil={isSeuil} />
        </div>
      </div>

      {notifications.length > 0 && (
        <NotificationList notifications={notifications} t={t.membrePage} />
      )}

      {enrollments.length === 0 && (
        <div className="rounded-lg border border-border bg-surface p-6">
          <p className="text-text-muted">
            {t.membrePage.emptyEnrollments}{" "}
            <Link href="/cursus" className="text-accent hover:underline">
              {t.membrePage.discover}
            </Link>
          </p>
        </div>
      )}

      {enrollments.map((enrollment) => {
        if (enrollment.cursus) {
          const cursus = enrollment.cursus;
          return (
            <section
              key={enrollment.id}
              className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6"
            >
              <h2 className="font-heading text-xl font-semibold text-text">
                {localize(locale, cursus.title, cursus.titleEn)}
              </h2>
              {cursus.levels.map((level) => (
                <div key={level.id} className="flex flex-col gap-1">
                  <p className="text-sm text-accent">
                    {t.membrePage.level} {level.number} —{" "}
                    {localize(locale, level.name, level.nameEn)}
                  </p>
                  <ul className="flex flex-col gap-1 pl-4">
                    {level.courses.map((course) => (
                      <li
                        key={course.id}
                        className="flex items-center justify-between text-sm text-text"
                      >
                        <Link
                          href={`/membre/cours/${course.id}`}
                          className="hover:text-accent hover:underline"
                        >
                          {localize(locale, course.title, course.titleEn)}
                        </Link>
                        <div className="flex items-center gap-2">
                          {sessionsRemainingByCourse[course.id] !== undefined && (
                            <span className="text-xs text-text-muted">
                              {sessionsRemainingByCourse[course.id]}/3{" "}
                              {t.membrePage.sessionsUnit}
                            </span>
                          )}
                          <CourseStateBadge
                            state={states[course.id]}
                            t={t.courseState}
                          />
                          {states[course.id] === "PURCHASE_REQUIRED" &&
                            course.products[0] && (
                              <PurchaseButton
                                productId={course.products[0].id}
                                label={t.membrePage.buy}
                              />
                            )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="flex items-center gap-2 border-t border-border pt-4">
                <WhatsAppButton
                  message={`${t.membrePage.whatsappCursusQuestion} « ${localize(locale, cursus.title, cursus.titleEn)} ».`}
                  label={t.membrePage.whatsapp}
                />
                <EmailButton
                  subject={`${t.membrePage.emailSubjectPrefix} — ${localize(locale, cursus.title, cursus.titleEn)}`}
                  label={t.membrePage.emailUs}
                />
              </div>
            </section>
          );
        }

        if (enrollment.formation) {
          const formation = enrollment.formation;
          const formationLocked = formation.parts.some((part) =>
            part.courses.some((c) => states[c.id] === "PURCHASE_REQUIRED"),
          );
          return (
            <section
              key={enrollment.id}
              className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl font-semibold text-text">
                  {localize(locale, formation.title, formation.titleEn)}
                </h2>
                {formationLocked && formation.products[0] && (
                  <PurchaseButton
                    productId={formation.products[0].id}
                    label={t.membrePage.buyFormation}
                  />
                )}
              </div>
              {formation.parts.map((part) => (
                <div key={part.id} className="flex flex-col gap-1">
                  <p className="text-sm text-accent">
                    {localize(locale, part.title, part.titleEn)}
                  </p>
                  <ul className="flex flex-col gap-1 pl-4">
                    {part.courses.map((course) => (
                      <li
                        key={course.id}
                        className="flex items-center justify-between text-sm text-text"
                      >
                        <Link
                          href={`/membre/cours/${course.id}`}
                          className="hover:text-accent hover:underline"
                        >
                          {localize(locale, course.title, course.titleEn)}
                        </Link>
                        <div className="flex items-center gap-2">
                          {sessionsRemainingByCourse[course.id] !== undefined && (
                            <span className="text-xs text-text-muted">
                              {sessionsRemainingByCourse[course.id]}/3{" "}
                              {t.membrePage.sessionsUnitPart}
                            </span>
                          )}
                          <CourseStateBadge
                            state={states[course.id]}
                            t={t.courseState}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="flex items-center gap-2 border-t border-border pt-4">
                <WhatsAppButton
                  message={`${t.membrePage.whatsappFormationQuestion} « ${localize(locale, formation.title, formation.titleEn)} ».`}
                  label={t.membrePage.whatsapp}
                />
                <EmailButton
                  subject={`${t.membrePage.emailSubjectPrefix} — ${localize(locale, formation.title, formation.titleEn)}`}
                  label={t.membrePage.emailUs}
                />
              </div>
            </section>
          );
        }

        return null;
      })}
    </main>
  );
}
