import { test, expect } from "@playwright/test";

/**
 * Konfetti-Test (M3) — prüft die Button-Interaktion:
 *  1. Klick auf „Dank Dennis!" löst Konfetti aus — canvas-confetti legt dazu ein
 *     <canvas> an, das vorher nicht existiert.
 *  2. Hinweis „(probier's aus)" ist sichtbar.
 *  3. prefers-reduced-motion: reduce → KEIN Konfetti (kein <canvas>).
 *  4. Keine Konsolen-Fehler.
 * Läuft per playwright.config.ts auf Desktop- UND Mobile-Viewport (DoD: mobil + Desktop).
 */

test("Klick auf den CTA löst Konfetti aus (Canvas erscheint)", async ({
  page,
}) => {
  await page.goto("/");

  // Vor dem Klick existiert noch kein Konfetti-Canvas.
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator(".hero__hint")).toHaveText("(probier's aus)");

  await page.getByRole("button", { name: "Dank Dennis!" }).click();

  // canvas-confetti legt sein Canvas beim ersten Auslösen an.
  await expect(page.locator("canvas")).toHaveCount(1);
});

test("mit prefers-reduced-motion: reduce löst KEIN Konfetti aus", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await page.getByRole("button", { name: "Dank Dennis!" }).click();

  // Kurz warten, damit ein etwaiges (fehlerhaftes) Canvas Zeit hätte zu erscheinen.
  await page.waitForTimeout(300);
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("keine Konsolen-Fehler beim Auslösen", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Dank Dennis!" }).click();
  await page.waitForTimeout(300);

  expect(
    consoleErrors,
    `Konsolen-Fehler: ${consoleErrors.join(" | ")}`,
  ).toEqual([]);
});
