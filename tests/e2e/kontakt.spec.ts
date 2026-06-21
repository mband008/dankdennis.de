import { test, expect } from "@playwright/test";

/**
 * Kontakt-Test (M8) — prüft die Sektion „Sag Hallo":
 *  1. Heading und Text-Kernphrase sind vorhanden.
 *  2. Alle vier Kontakt-Buttons (E-Mail/Instagram/LinkedIn/WhatsApp) sind da …
 *  3. … und als Platzhalter markiert (data-placeholder + aria-disabled), noch ohne href.
 *  4. Keine Konsolen-Fehler.
 * Läuft per playwright.config.ts auf Desktop- UND Mobile-Viewport (DoD: mobil + Desktop).
 */

const LABELS = ["E-Mail", "Instagram", "LinkedIn", "WhatsApp"];

test("Heading und Text sind vorhanden", async ({ page }) => {
  await page.goto("/");

  const contact = page.locator("#kontakt");
  await expect(contact.locator("h2")).toHaveText("Sag Hallo");
  await expect(contact).toContainText("willst du einfach mal");

  // M8 hat keine Platzhalter-Notiz mehr.
  await expect(contact.locator(".placeholder-note")).toHaveCount(0);
});

test("alle vier Kontakt-Buttons sind als Platzhalter vorhanden", async ({
  page,
}) => {
  await page.goto("/");

  const buttons = page.locator("#kontakt .contact__btn");
  await expect(buttons).toHaveCount(LABELS.length);

  for (const label of LABELS) {
    const btn = page.locator("#kontakt .contact__btn", { hasText: label });
    await expect(btn).toBeVisible();
    // Platzhalter-Markierung bleibt (noch kein echter Link) …
    await expect(btn).toHaveAttribute("data-placeholder", "");
    // … und jeder Button trägt sein Plattform-Icon (Inline-SVG).
    await expect(btn.locator("svg")).toHaveCount(1);
  }

  // Solange Kontaktwege offen sind: keine echten Links (kein <a href>) in der Sektion.
  await expect(page.locator("#kontakt a[href]")).toHaveCount(0);
});

test("keine Konsolen-Fehler in der Kontakt-Sektion", async ({ page }) => {
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
