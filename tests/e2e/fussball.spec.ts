import { test, expect } from "@playwright/test";

/**
 * Fußball-Test (M6/M10) — prüft die Sektion „Abseits der Werkstatt":
 *  1. Heading und Text-Kernphrase sind vorhanden.
 *  2. Die Akzent-Tonzone ist gesetzt (Klasse tone-sport = rot/gelb).
 *  3. M10: Galerie mit vier optimierten Fotos (AVIF/WebP + srcset) und Alt-Texten.
 *  4. Keine Konsolen-Fehler.
 * Läuft per playwright.config.ts auf Desktop- UND Mobile-Viewport (DoD: mobil + Desktop).
 */

test("Heading, Text und Akzent-Tonzone sind vorhanden", async ({ page }) => {
  await page.goto("/");

  const football = page.locator("#fussball");
  await expect(football.locator("h2")).toHaveText("Abseits der Werkstatt");
  await expect(football).toContainText(
    "im roten Trikot der ASG Vorwärts Dessau",
  );

  // Akzent-Tonzone (rot/gelb) muss gesetzt sein.
  await expect(football).toHaveClass(/tone-sport/);

  // M6 hat keine Platzhalter-Notiz mehr.
  await expect(football.locator(".placeholder-note")).toHaveCount(0);
});

test("Galerie zeigt vier optimierte Fotos mit Alt-Texten", async ({ page }) => {
  await page.goto("/");

  const items = page.locator("#fussball .football__item");
  await expect(items).toHaveCount(4);

  for (let i = 0; i < 4; i++) {
    const item = items.nth(i);
    await expect(item.locator("picture source[type='image/avif']")).toHaveCount(
      1,
    );
    const img = item.locator("img");
    await expect(img).toBeVisible();
    await img.scrollIntoViewIfNeeded();
    await expect
      .poll(async () => img.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0);
    expect((await img.getAttribute("alt"))?.length ?? 0).toBeGreaterThan(0);
    expect(await img.getAttribute("srcset")).toBeTruthy();
  }
});

test("keine Konsolen-Fehler in der Fußball-Sektion", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.goto("/", { waitUntil: "networkidle" });

  expect(
    consoleErrors,
    `Konsolen-Fehler: ${consoleErrors.join(" | ")}`,
  ).toEqual([]);
});
