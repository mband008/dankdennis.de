import { test, expect } from "@playwright/test";

/**
 * Layout-Test (M1) — beweist, dass das Sektions-Grundgerüst trägt:
 *  1. Alle 7 Section-/Footer-Anker sind vorhanden …
 *  2. … und stehen in der korrekten docs-Reihenfolge (DOM-Reihenfolge = Scroll-Fluss).
 *  3. Jede Sektion hat ihre Heading.
 *  4. KEINE Konsolen-Fehler.
 * Läuft per playwright.config.ts auf Desktop- UND Mobile-Viewport (DoD: mobil + Desktop).
 */

// Reihenfolge aus docs/dankdennis_bauplan.md (Abschnitt für Abschnitt).
const SECTIONS = [
  { id: "hero", heading: "Problem? Dank Dennis." },
  { id: "ueber", heading: "Hi, ich bin Dennis." },
  { id: "werkstatt", heading: "In der Werkstatt" },
  { id: "fussball", heading: "Abseits der Werkstatt" },
  { id: "counter", heading: "Probleme gelöst dank Dennis" },
  { id: "kontakt", heading: "Sag Hallo" },
  { id: "footer", heading: "Dank Dennis ·" },
];

test("alle Section-Anker sind vorhanden und sichtbar", async ({ page }) => {
  await page.goto("/");

  for (const { id } of SECTIONS) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
});

test("Sektionen stehen in der korrekten Reihenfolge", async ({ page }) => {
  await page.goto("/");

  // Alle Sektions-Anker in DOM-Reihenfolge einsammeln und mit der Soll-Liste vergleichen.
  const expectedIds = SECTIONS.map((s) => s.id);
  const idSelector = expectedIds.map((id) => `#${id}`).join(", ");
  const actualIds = await page
    .locator(idSelector)
    .evaluateAll((nodes) => nodes.map((n) => n.id));

  expect(actualIds).toEqual(expectedIds);
});

test("jede Sektion hat ihre Heading", async ({ page }) => {
  await page.goto("/");

  for (const { id, heading } of SECTIONS) {
    await expect(page.locator(`#${id}`)).toContainText(heading);
  }
});

test("keine Konsolen-Fehler auf der Seite", async ({ page }) => {
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
