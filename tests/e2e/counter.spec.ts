import { test, expect } from "@playwright/test";

/**
 * Counter-Test (M7) — prüft die Scoreboard-Sektion „Probleme gelöst dank Dennis":
 *  1. Die Zahl steht unter dem Fold zunächst auf 0 und zählt beim Reinscrollen auf 1.337.
 *  2. Untertext „…und es werden täglich mehr." ist vorhanden.
 *  3. prefers-reduced-motion: reduce → sofort Endwert (1.337), ohne Hochzählen.
 *  4. Keine Konsolen-Fehler.
 * Läuft per playwright.config.ts auf Desktop- UND Mobile-Viewport (DoD: mobil + Desktop).
 */

test("zählt beim Reinscrollen von 0 auf 1.337 hoch", async ({ page }) => {
  await page.goto("/");

  const number = page.locator("#counter .counter__number");

  // Sektion liegt unter dem Fold → Script hat auf 0 zurückgesetzt, noch nicht animiert.
  await expect(number).toHaveText("0");
  await expect(page.locator("#counter")).toContainText(
    "…und es werden täglich mehr.",
  );

  // Reinscrollen löst den Count-Up aus; am Ende steht der Zielwert.
  await number.scrollIntoViewIfNeeded();
  await expect(number).toHaveText("1.337");

  // M7 hat keine Platzhalter-Notiz mehr.
  await expect(page.locator("#counter .placeholder-note")).toHaveCount(0);
});

test("mit prefers-reduced-motion: reduce sofort Endwert (kein Hochzählen)", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  // Ohne Scrollen: die Zahl steht direkt auf dem Endwert (keine 0-Phase, keine Animation).
  await expect(page.locator("#counter .counter__number")).toHaveText("1.337");
});

test("keine Konsolen-Fehler in der Counter-Sektion", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("#counter .counter__number").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  expect(
    consoleErrors,
    `Konsolen-Fehler: ${consoleErrors.join(" | ")}`,
  ).toEqual([]);
});
