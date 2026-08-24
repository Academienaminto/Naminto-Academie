import { test, expect } from "@playwright/test";
import { deleteUserByEmail, markEmailVerified } from "./helpers/db";

const email = `e2e.auth.${Date.now()}@naminto.test`;
const password = "TestE2EAuth2026!";

test.describe("Authentification", () => {
  test.afterAll(async () => {
    await deleteUserByEmail(email);
  });

  test("un visiteur peut créer un compte, se déconnecter puis se reconnecter", async ({
    page,
  }) => {
    await page.goto("/inscription");
    await page.getByLabel("Prénom").fill("E2E");
    await page.getByLabel("Nom", { exact: true }).fill("Test");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mot de passe").fill(password);
    await page.getByRole("button", { name: "Créer mon compte" }).click();

    // §72 : l'inscription n'ouvre plus de session directement — le compte
    // n'est actif qu'après clic sur le lien reçu par email. Les tests E2E
    // n'ont pas accès à la boîte mail réelle, donc on court-circuite via DB.
    await expect(page.getByText("Vérifiez votre boîte mail")).toBeVisible();
    await markEmailVerified(email);

    await page.goto("/connexion");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mot de passe").fill(password);
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(page).toHaveURL(/\/membre/);
    await expect(page.getByRole("heading", { name: "Bonjour, E2E" })).toBeVisible();

    await page.getByRole("button", { name: "Se déconnecter" }).click();
    await expect(page).toHaveURL(/\/connexion/);

    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mot de passe").fill(password);
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(page).toHaveURL(/\/membre/);
    await expect(page.getByRole("heading", { name: "Bonjour, E2E" })).toBeVisible();
  });

  test("un mot de passe incorrect affiche une erreur et ne connecte pas", async ({
    page,
  }) => {
    await page.goto("/connexion");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mot de passe").fill("MauvaisMotDePasse123!");
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(page.getByText(/identifiants|incorrect|invalide/i)).toBeVisible();
    await expect(page).toHaveURL(/\/connexion/);
  });
});
