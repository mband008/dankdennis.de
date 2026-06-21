import { test, expect } from "@playwright/test";

/**
 * Über-Test (M4) — prüft die Sektion „Wer ist Dennis":
 *  1. Heading „Hi, ich bin Dennis." und beide Absätze (Kernphrasen) sind vorhanden.
 *  2. Split-Layout stimmt je Viewport: mobil Bild OBEN, Desktop Bild LINKS.
 *  3. Keine Konsolen-Fehler.
 * Läuft per playwright.config.ts auf Desktop- UND Mobile-Viewport (DoD: mobil + Desktop).
 */

test("Heading und beide Absätze sind vorhanden", async ({ page }) => {
  await page.goto("/");

  const about = page.locator("#ueber");
  await expect(about.locator("h2")).toHaveText("Hi, ich bin Dennis.");
  await expect(about).toContainText("Teil eines Schreiner-Teams im Ladenbau");
  await expect(about).toContainText("Der Name dieser Seite?");

  // M4 hat keine Platzhalter-Notiz mehr.
  await expect(about.locator(".placeholder-note")).toHaveCount(0);
});

test("Split-Layout: mobil Bild oben, Desktop Bild links", async ({ page }) => {
  await page.goto("/");

  const text = page.locator("#ueber .about__text");
  const media = page.locator("#ueber .about__media");

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
    // Zweispaltig: Bild links neben dem Text.
    expect(mediaBox.x).toBeLessThan(textBox.x);
  }
});

test("Über-Foto ist optimiert eingebunden (AVIF/WebP, srcset, Alt)", async ({
  page,
}) => {
  await page.goto("/");

  const media = page.locator("#ueber .about__media");
  await expect(media.locator("picture source[type='image/avif']")).toHaveCount(
    1,
  );
  const img = media.locator("img");
  await img.scrollIntoViewIfNeeded();
  await expect(img).toBeVisible();
  await expect
    .poll(async () => img.evaluate((el: HTMLImageElement) => el.naturalWidth))
    .toBeGreaterThan(0);
  expect((await img.getAttribute("alt"))?.length ?? 0).toBeGreaterThan(0);
  expect(await img.getAttribute("srcset")).toBeTruthy();
});

test("keine Konsolen-Fehler in der Über-Sektion", async ({ page }) => {
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
