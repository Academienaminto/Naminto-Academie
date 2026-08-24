import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  timeout: 300000,
  expect: {
    // Contre une base Supabase distante réelle (jamais mockée) : une
    // requête individuelle a été observée jusqu'à 15-19s sous charge (dev
    // server Turbopack + latence réseau), largement au-dessus de l'ancien
    // seuil de 15s qui ne laissait aucune marge à l'assertion suivante.
    timeout: 30000,
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://localhost:3000",
  },
});
