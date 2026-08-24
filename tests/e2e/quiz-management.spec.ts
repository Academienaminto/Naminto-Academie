import { test, expect } from "@playwright/test";
import { db, deleteUserByEmail, grantSeuilRole, markEmailVerified } from "./helpers/db";

const run = Date.now();
const email = `e2e.quiz.${run}@naminto.test`;
const password = "TestE2EQuiz2026!";
const cursusTitle = `E2E Cursus ${run}`;
const courseTitle = `E2E Cours ${run}`;

test.describe.serial("Gestion et passage d'un quiz", () => {
  let cursusId: string;

  test.afterAll(async () => {
    const cursus = await db.cursus.findFirst({ where: { title: cursusTitle } });
    if (cursus) {
      const levels = await db.level.findMany({ where: { cursusId: cursus.id } });
      for (const level of levels) {
        const courses = await db.course.findMany({ where: { levelId: level.id } });
        for (const course of courses) {
          const quiz = await db.quiz.findUnique({ where: { courseId: course.id } });
          if (quiz) {
            const attempts = await db.quizAttempt.findMany({ where: { quizId: quiz.id } });
            for (const attempt of attempts) {
              await db.quizAnswer.deleteMany({ where: { attemptId: attempt.id } });
            }
            await db.quizAttempt.deleteMany({ where: { quizId: quiz.id } });
            const questions = await db.quizQuestion.findMany({ where: { quizId: quiz.id } });
            for (const question of questions) {
              await db.quizOption.deleteMany({ where: { questionId: question.id } });
            }
            await db.quizQuestion.deleteMany({ where: { quizId: quiz.id } });
            await db.quiz.delete({ where: { id: quiz.id } });
          }
          await db.learningSession.deleteMany({ where: { courseId: course.id } });
          await db.courseProgress.deleteMany({ where: { courseId: course.id } });
          await db.deadline.deleteMany({ where: { courseId: course.id } });
        }
      }
      await db.enrollment.deleteMany({ where: { cursusId: cursus.id } });
      await db.course.deleteMany({ where: { level: { cursusId: cursus.id } } });
      await db.level.deleteMany({ where: { cursusId: cursus.id } });
      await db.cursus.delete({ where: { id: cursus.id } });
    }
    await deleteUserByEmail(email);
  });

  test("un membre créé, promu Seuil, construit un cursus et un quiz complet via l'UI", async ({
    page,
  }) => {
    await page.goto("/inscription");
    await page.getByLabel("Prénom").fill("E2E");
    await page.getByLabel("Nom", { exact: true }).fill("Quiz");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mot de passe").fill(password);
    await page.getByRole("button", { name: "Créer mon compte" }).click();

    // §72 : plus de session automatique à l'inscription — on court-circuite
    // la vérification d'email (boîte mail réelle inaccessible aux tests).
    await expect(page.getByText("Vérifiez votre boîte mail")).toBeVisible();
    await markEmailVerified(email);
    await grantSeuilRole(email);

    await page.goto("/connexion");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mot de passe").fill(password);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/seuil/);

    await page.goto("/seuil/cursus");
    await page.getByLabel("Titre", { exact: true }).fill(cursusTitle);
    await page.getByRole("button", { name: "Créer" }).click();
    await expect(page.getByText(cursusTitle)).toBeVisible();

    await page.getByRole("link", { name: new RegExp(cursusTitle) }).click();
    await expect(page).toHaveURL(/\/seuil\/cursus\/.+/);
    cursusId = page.url().split("/").pop()!;

    await page.getByRole("button", { name: "Publier" }).click();
    await expect(page.getByText("PUBLIE")).toBeVisible();

    await page.getByLabel("Numéro (1-9)").fill("1");
    await page.getByLabel("Nom", { exact: true }).fill("Niveau E2E");
    await page.getByRole("button", { name: "Ajouter" }).click();
    await expect(page.getByText("Niveau 1 — Niveau E2E")).toBeVisible();

    await page.getByLabel("Position (1-6)").fill("1");
    await page.getByLabel("Titre du cours").fill(courseTitle);
    await page.getByRole("button", { name: "Ajouter le cours" }).click();
    await expect(page.getByText(courseTitle)).toBeVisible();

    await page.getByRole("button", { name: "Publier", exact: true }).last().click();
    await expect(page.getByText(courseTitle).locator("..")).toContainText("PUBLIE");

    await page.getByRole("link", { name: "Quiz" }).click();
    await expect(page).toHaveURL(/\/seuil\/courses\/.+\/quiz/);

    await page.getByLabel("Titre", { exact: true }).fill("Quiz E2E");
    await page.getByRole("button", { name: "Créer" }).click();
    await expect(page.getByText("Quiz E2E")).toBeVisible();

    await page.getByLabel("Question", { exact: true }).fill("2 + 2 = ?");
    await page.getByPlaceholder("Option 1", { exact: true }).fill("4");
    await page.getByPlaceholder("Option 2", { exact: true }).fill("5");
    await page.locator('input[type="radio"]').first().check();
    await page.getByRole("button", { name: "Ajouter la question" }).click();
    await expect(page.getByText("2 + 2 = ?")).toBeVisible();

    await page.getByRole("button", { name: "Publier" }).click();
    await expect(page.getByText("PUBLIE")).toBeVisible();

    const courseUrl = page.url().split("/seuil/courses/")[1].split("/quiz")[0];

    const enrollRes = await page.request.post("/api/v1/enrollments", {
      data: { cursusId },
    });
    expect(enrollRes.ok()).toBeTruthy();

    await page.goto(`/membre/cours/${courseUrl}`);
    await expect(page.getByText("Commencer le quiz")).toBeVisible();
    await page.getByRole("button", { name: "Commencer le quiz" }).click();

    await expect(page.getByText("2 + 2 = ?")).toBeVisible();
    await page.locator('input[type="radio"]').first().check();
    await page.getByRole("button", { name: "Soumettre" }).click();

    await expect(page.getByText(/réussi|score|résultat/i)).toBeVisible();
  });
});
