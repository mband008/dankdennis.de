import { test, expect } from "@playwright/test";

/**
 * Fußball-Test (M6) — prüft die Sektion „Abseits der Werkstatt":
 *  1. Heading und Text-Kernphrase sind vorhanden.
 *  2. Die Akzent-Tonzone ist gesetzt (Klasse tone-sport = rot/gelb).
 *  3. Split-Layout stimmt je Viewport: mobil Bild OBEN, Desktop Bild RECHTS.
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

test("Split-Layout: mobil Bild oben, Desktop Bild rechts", async ({ page }) => {
  await page.goto("/");

  const text = page.locator("#fussball .football__text");
  const media = page.locator("#fussball .football__media");

  const textBox = await text.boundingBox();
  const mediaBox = await media.boundingBox();
  expect(textBox).not.toBeNull();
  expect(mediaBox).not.toBeNull();
  if (!textBox || !mediaBox) return;

  const viewport = page.viewportSize();
  const isMobile = (viewport?.width ?? 0) < 768;

  if (isMobile) {
    expect(mediaBox.y).toBeLessThan(textBox.y);
  } else {
    expect(mediaBox.x).toBeGreaterThan(textBox.x);
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
