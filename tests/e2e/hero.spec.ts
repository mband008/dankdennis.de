import { test, expect } from "@playwright/test";

/**
 * Hero-Test (M2) — prüft die Above-the-fold-Sektion:
 *  1. Headline (einzige <h1>), Untertitel und Button „Dank Dennis!" sind vorhanden.
 *  2. Der Button ist noch reiner Platzhalter (kein Konfetti) — der Click wirft nichts.
 *  3. Split-Layout stimmt je Viewport: mobil Bild ÜBER dem Text, Desktop Bild RECHTS.
 *  4. Keine Konsolen-Fehler.
 * Läuft per playwright.config.ts auf Desktop- UND Mobile-Viewport (DoD: mobil + Desktop).
 */

test("Headline, Untertitel und Button sind vorhanden", async ({ page }) => {
  await page.goto("/");

  const hero = page.locator("#hero");
  await expect(hero.locator("h1")).toHaveText("Problem? Dank Dennis.");
  await expect(hero).toContainText(
    "Tischler aus Überzeugung, Fußballer aus Leidenschaft",
  );

  const cta = hero.getByRole("button", { name: "Dank Dennis!" });
  await expect(cta).toBeVisible();

  // M2 hat noch keine Platzhalter-Notiz mehr und noch keine Konfetti-Logik.
  await expect(hero.locator(".placeholder-note")).toHaveCount(0);
});

test("Split-Layout: mobil Bild oben, Desktop Bild rechts", async ({ page }) => {
  await page.goto("/");

  const text = page.locator("#hero .hero__text");
  const media = page.locator("#hero .hero__media");

  const textBox = await text.boundingBox();
  const mediaBox = await media.boundingBox();
  expect(textBox).not.toBeNull();
  expect(mediaBox).not.toBeNull();
  if (!textBox || !mediaBox) return;

  const viewport = page.viewportSize();
  const isMobile = (viewport?.width ?? 0) < 768;

  if (isMobile) {
    // Einspaltig: Bild steht über dem Text.
    expect(mediaBox.y).toBeLessThan(textBox.y);
  } else {
    // Zweispaltig: Bild rechts neben dem Text.
    expect(mediaBox.x).toBeGreaterThan(textBox.x);
  }
});

test("keine Konsolen-Fehler in der Hero-Sektion", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Dank Dennis!" }).click();

  expect(
    consoleErrors,
    `Konsolen-Fehler: ${consoleErrors.join(" | ")}`,
  ).toEqual([]);
});
