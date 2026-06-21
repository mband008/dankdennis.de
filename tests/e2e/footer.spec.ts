import { test, expect } from "@playwright/test";

/**
 * Footer-Test (M9) — prüft den Abschluss-Footer + Easter-Egg:
 *  1. „Dank Dennis · <Jahr>" mit dynamischem (aktuellem) Jahr.
 *  2. Die Konfetti-Reprise: ein [data-confetti]-Button, dessen Klick Konfetti auslöst
 *     (beweist, dass der globale Handler auch den Footer bindet).
 *  3. prefers-reduced-motion: reduce → kein Konfetti.
 *  4. Keine Konsolen-Fehler.
 * Läuft per playwright.config.ts auf Desktop- UND Mobile-Viewport (DoD: mobil + Desktop).
 */

test("Footer zeigt Dank Dennis mit dynamischem Jahr", async ({ page }) => {
  await page.goto("/");

  const footer = page.locator("#footer");
  const year = new Date().getFullYear().toString();
  await expect(footer.locator(".footer__line")).toHaveText(
    `Dank Dennis · ${year}`,
  );
});

test("Credit-Zeile nennt Michael Banditt mit Link auf seine Seite", async ({
  page,
}) => {
  await page.goto("/");

  const credit = page.locator("#footer .footer__credit");
  await expect(credit).toContainText("Made with");
  await expect(credit).toContainText("für seinen geliebten Bruder");

  const link = credit.getByRole("link", { name: "Michael Banditt" });
  await expect(link).toHaveAttribute("href", "https://michaelbanditt.de");
  await expect(link).toHaveAttribute("rel", /noopener/);
});

test("Easter-Egg-Button löst Konfetti aus", async ({ page }) => {
  await page.goto("/");

  const egg = page.locator("#footer .footer__egg");
  await expect(egg).toHaveAttribute("data-confetti", "");

  await expect(page.locator("canvas")).toHaveCount(0);
  await egg.click();
  await expect(page.locator("canvas")).toHaveCount(1);
});

test("mit prefers-reduced-motion: reduce löst der Footer kein Konfetti aus", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await page.locator("#footer .footer__egg").click();
  await page.waitForTimeout(300);
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("keine Konsolen-Fehler im Footer", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("#footer .footer__egg").click();
  await page.waitForTimeout(300);

  expect(
    consoleErrors,
    `Konsolen-Fehler: ${consoleErrors.join(" | ")}`,
  ).toEqual([]);
});
