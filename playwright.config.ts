import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright-Konfiguration für dankdennis.de.
 *
 * webServer: baut die Seite und startet `astro preview` auf festem Port. Playwright
 * wartet, bis der Server steht, und fährt die Tests dann gegen den echten statischen
 * Build (= das, was später auch Coolify ausliefert).
 *
 * Projekte: Desktop-Chromium + Mobile (Pixel 7) — beide Viewports werden geprüft,
 * weil die Seite mobil UND auf Desktop gut aussehen muss (DoD).
 */
const PORT = 4321;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : [["list"], ["html", { open: "never" }]],

  use: {
    baseURL,
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
    },
  ],

  webServer: {
    command: "npm run build && npm run preview",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
