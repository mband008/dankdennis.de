import { test, expect } from "@playwright/test";

/**
 * Werkstatt-Test (M5) — prüft die Sektion „In der Werkstatt":
 *  1. Heading „In der Werkstatt" und die Text-Kernphrase sind vorhanden.
 *  2. Die galerie-fähige Struktur steht: .workshop__gallery mit mindestens einem
 *     sichtbaren Bild-Item.
 *  3. Keine Konsolen-Fehler.
 * Läuft per playwright.config.ts auf Desktop- UND Mobile-Viewport (DoD: mobil + Desktop).
 */

test("Heading und Text sind vorhanden", async ({ page }) => {
  await page.goto("/");

  const workshop = page.locator("#werkstatt");
  await expect(workshop.locator("h2")).toHaveText("In der Werkstatt");
  await expect(workshop).toContainText(
    "Präzision ist für mich kein Extra, sondern der Standard",
  );

  // M5 hat keine Platzhalter-Notiz mehr.
  await expect(workshop.locator(".placeholder-note")).toHaveCount(0);
});

test("galerie-fähige Bild-Struktur mit mindestens einem Item", async ({
  page,
}) => {
  await page.goto("/");

  const gallery = page.locator("#werkstatt .workshop__gallery");
  await expect(gallery).toBeVisible();

  const items = gallery.locator(".workshop__item");
  expect(await items.count()).toBeGreaterThanOrEqual(1);
  await expect(items.first()).toBeVisible();
});

test("keine Konsolen-Fehler in der Werkstatt-Sektion", async ({ page }) => {
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
