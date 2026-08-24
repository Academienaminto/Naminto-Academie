import { notFound } from "next/navigation";
import { AppError } from "@/lib/errors";
import { getCourseSummary } from "@/modules/progress/service";
import { getQuizForCourseAdmin } from "@/modules/quiz/service";
import { CreateQuizForm } from "@/components/forms/seuil/CreateQuizForm";
import { AddQuestionForm } from "@/components/forms/seuil/AddQuestionForm";
import { StatusButton } from "@/components/forms/seuil/StatusButton";

const TYPE_LABELS: Record<string, string> = {
  CHOIX_UNIQUE: "Choix unique",
  CHOIX_MULTIPLE: "Choix multiple",
  PREUVE_PRATIQUE: "Preuve pratique",
};

// Édition du quiz d'un cours (création si absent, sinon liste des
// questions + publication). Comme la page matériel voisine, fonctionne
// aussi bien pour un cours de cursus que de formation (getCourseSummary
// gère les deux via formationPart).
export default async function SeuilCourseQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let course;
  try {
    course = await getCourseSummary(id);
  } catch (err) {
    // AppError RESOURCE_NOT_FOUND -> 404 Next.js.
    if (err instanceof AppError && err.code === "RESOURCE_NOT_FOUND") {
      notFound();
    }
    throw err;
  }

  // getQuizForCourseAdmin : contrairement à la vue apprenant
  // (getCourseQuizStatus), inclut isCorrect sur les options — usage Seuil
  // uniquement, jamais exposé à un membre.
  const quiz = await getQuizForCourseAdmin(id);

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <h1 className="font-heading text-2xl font-semibold text-text">
        Quiz — {course.title}
      </h1>

      {!quiz && <CreateQuizForm courseId={id} />}

      {quiz && (
        <>
          <section className="flex items-center justify-between rounded-lg border border-border bg-surface p-6">
            <div>
              <p className="text-text">{quiz.title}</p>
              <p className="text-sm text-text-muted">
                Seuil de validation : {quiz.passingScore}% — {quiz.status}
              </p>
            </div>
            {quiz.status === "PUBLIE" ? (
              <StatusButton
                endpoint={`/api/v1/quizzes/${quiz.id}/status`}
                status="BROUILLON"
                label="Dépublier"
                variant="tertiary"
              />
            ) : (
              <StatusButton
                endpoint={`/api/v1/quizzes/${quiz.id}/status`}
                status="PUBLIE"
                label="Publier"
              />
            )}
          </section>

          <section className="flex flex-col gap-3">
            {quiz.questions.map((question) => (
              <div
                key={question.id}
                className="rounded-lg border border-border bg-surface p-4"
              >
                <p className="text-sm text-text">
                  {question.position}. {question.question}
                </p>
                <p className="text-xs uppercase tracking-wide text-text-muted">
                  {TYPE_LABELS[question.type] ?? question.type} — {question.points} pt(s)
                </p>
                {question.options.length > 0 && (
                  <ul className="mt-2 flex flex-col gap-1 pl-4">
                    {question.options.map((option) => (
                      <li
                        key={option.id}
                        className={`text-sm ${option.isCorrect ? "text-success" : "text-text-muted"}`}
                      >
                        {option.isCorrect ? "✓" : "—"} {option.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {quiz.questions.length === 0 && (
              <p className="text-text-muted">Aucune question pour le moment.</p>
            )}
          </section>

          <AddQuestionForm quizId={quiz.id} nextPosition={quiz.questions.length + 1} />
        </>
      )}
    </main>
  );
}
