import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import { getCourseAccessState, getCourseSummary } from "@/modules/progress/service";
import { getCourseQuizStatus } from "@/modules/quiz/service";
import { listMineForCourse } from "@/modules/sessions/service";
import { PurchaseButton } from "@/components/forms/PurchaseButton";
import { DownloadCourseButton } from "@/components/forms/DownloadCourseButton";
import { QuizRunner } from "@/components/forms/QuizRunner";
import { CourseStateBadge } from "@/components/ui/CourseStateBadge";
import { getDictionary } from "@/lib/i18n/locale";
import { localize, localizeOptional } from "@/lib/i18n/content";

// Fiche détail d'un cours : calcule l'état d'accès (LOCKED / PURCHASE_REQUIRED
// / ACCESSIBLE / CLOSED_FOR_DELAY — voir modules/progress/service.ts,
// RÈGLES MÉTIER §18 et §23-26) et n'affiche matériel, séances et quiz que
// si le cours est ACCESSIBLE. L'état n'est jamais reçu du frontend, il est
// recalculé ici côté serveur à chaque rendu.
export default async function CoursDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect("/connexion");
  }

  let summary;
  try {
    summary = await getCourseSummary(id);
  } catch (err) {
    // getCourseSummary lève RESOURCE_NOT_FOUND (AppError) si le cours n'existe
    // pas : converti ici en 404 Next.js. Toute autre erreur remonte telle quelle.
    if (err instanceof AppError && err.code === "RESOURCE_NOT_FOUND") {
      notFound();
    }
    throw err;
  }

  const state = await getCourseAccessState(user.id, id);

  // Quiz et séances ne sont interrogés que si le cours est ACCESSIBLE : évite
  // des requêtes inutiles pour un cours verrouillé ou dont l'achat est requis.
  const quizStatus = state === "ACCESSIBLE" ? await getCourseQuizStatus(user.id, id) : null;
  const sessions = state === "ACCESSIBLE" ? await listMineForCourse(user.id, id) : null;
  const { t, locale } = await getDictionary();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <Link href="/membre" className="text-sm text-text-muted hover:text-accent">
        {t.courseDetail.back}
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-text">
          {localize(locale, summary.title, summary.titleEn)}
        </h1>
        <CourseStateBadge state={state} t={t.courseState} />
      </div>

      {summary.description && (
        <p className="text-text-muted">
          {localizeOptional(locale, summary.description, summary.descriptionEn)}
        </p>
      )}

      {state === "LOCKED" && (
        <p className="text-sm text-text-muted">{t.courseDetail.locked}</p>
      )}

      {state === "PURCHASE_REQUIRED" && summary.productId && (
        <PurchaseButton productId={summary.productId} label={t.courseDetail.buy} />
      )}

      {state === "CLOSED_FOR_DELAY" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-error">{t.courseDetail.closedForDelay}</p>
          {summary.productId && (
            <PurchaseButton productId={summary.productId} label={t.courseDetail.buyAgain} />
          )}
        </div>
      )}

      {state === "ACCESSIBLE" && (
        <>
          <section className="rounded-lg border border-border bg-surface p-4">
            <p className="mb-3 text-xs uppercase tracking-wide text-text-muted">
              {t.courseDetail.material}
            </p>
            <DownloadCourseButton
              courseId={id}
              label={t.courseDetail.download}
              pendingLabel={t.courseDetail.downloading}
            />
          </section>

          {sessions && sessions.length > 0 && (
            <section className="rounded-lg border border-border bg-surface p-4">
              <p className="text-xs uppercase tracking-wide text-text-muted">
                {t.courseDetail.sessions}
              </p>
              <p className="text-sm text-text">
                {sessions.filter((s) => s.status === "DISPONIBLE").length}/3{" "}
                {t.courseDetail.sessionsAvailable} —{" "}
                <Link href="/membre/rendez-vous" className="text-accent hover:underline">
                  {t.courseDetail.bookAppointment}
                </Link>
              </p>
            </section>
          )}

          {quizStatus ? (
            <section className="rounded-lg border border-border bg-surface p-6">
              <p className="mb-4 text-xs uppercase tracking-wide text-text-muted">
                {t.courseDetail.quiz} —{" "}
                {localize(locale, quizStatus.quiz.title, quizStatus.quiz.titleEn)}
              </p>
              <QuizRunner
                quizId={quizStatus.quiz.id}
                questions={quizStatus.quiz.questions}
                attemptId={
                  quizStatus.pendingAttempt?.status === "EN_COURS"
                    ? quizStatus.pendingAttempt.id
                    : null
                }
                passed={quizStatus.passed}
                attemptsUsed={quizStatus.attemptsUsed}
                maxAttempts={quizStatus.maxAttempts}
                awaitingReview={quizStatus.pendingAttempt?.status === "EN_ATTENTE_VALIDATION"}
                t={t.quiz}
                locale={locale}
              />
            </section>
          ) : (
            <p className="text-sm text-text-muted">{t.courseDetail.noQuiz}</p>
          )}
        </>
      )}
    </main>
  );
}
