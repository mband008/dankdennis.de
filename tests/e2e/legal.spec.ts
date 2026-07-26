import { test, expect } from "@playwright/test";

/**
 * Legal-Test (M15) — Impressum + Datenschutz:
 *  1. Beide Seiten rendern mit korrektem h1 + seitenspezifischem <title>.
 *  2. Kern-Inhalte vorhanden (Diensteanbieter, Verantwortlicher, Hetzner).
 *  3. Footer-Links zu /impressum + /datenschutz auf JEDER Seite (Start + Rechtsseiten),
 *     von der Startseite aus erreichbar; „← Zur Startseite"-Link führt zurück.
 *  4. SAFETY-GUARD: die gerenderte /datenschutz-Seite enthält KEINE Entwurfs-/Platzhalter-
 *     Marker — so kann keine unfertige Rechtsseite live gehen.
 *  5. meta robots `noindex, follow`; keine Konsolen-Fehler.
 * Läuft per playwright.config.ts auf Desktop- UND Mobile-Viewport (DoD: mobil + Desktop).
 */

test("Impressum rendert mit h1, Titel und Kern-Inhalten", async ({ page }) => {
  await page.goto("/impressum");

  await expect(page).toHaveTitle("Impressum — Dank Dennis");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Impressum");

  const main = page.locator("main#main");
  await expect(main).toContainText("Dennis Müller");
  await expect(main).toContainText("Diensteanbieter");
  await expect(main).toContainText("gigasetdennis@gmail.com");
});

test("Telefonnummer steht nicht im Klartext im Quelltext (Spam-Schutz)", async ({
  page,
}) => {
  const response = await page.goto("/impressum");
  const html = (await response?.text()) ?? "";

  // Weder formatiert noch als reine Ziffernkette darf die Nummer im HTML stehen.
  expect(html).not.toContain("+49 176 37633091");
  expect(html).not.toContain("4917637633091");
  expect(html).not.toContain("017637633091");
  // Auch nicht im gerenderten DOM, solange niemand geklickt hat.
  const body = (await page.locator("body").textContent()) ?? "";
  expect(body.replace(/\s/g, "")).not.toContain("37633091");
});

test("Telefonnummer erscheint erst auf Klick — als tel:-Link", async ({
  page,
}) => {
  await page.goto("/impressum");

  const btn = page.getByRole("button", { name: "Nummer anzeigen" });
  await expect(btn).toBeVisible();

  await btn.click();

  // Button ist weg, an seiner Stelle steht der anrufbare Link mit der Nummer.
  await expect(btn).toHaveCount(0);
  const tel = page.locator(".phone-reveal a");
  await expect(tel).toHaveText("+49 176 37633091");
  await expect(tel).toHaveAttribute("href", "tel:+4917637633091");
  // Der Spam-Hinweis verschwindet mit dem Button.
  await expect(page.locator(".phone-reveal__hint")).toHaveCount(0);
});

test("Datenschutz rendert mit h1, Titel und Kern-Inhalten", async ({
  page,
}) => {
  await page.goto("/datenschutz");

  await expect(page).toHaveTitle("Datenschutz — Dank Dennis");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Datenschutzerklärung",
  );

  const main = page.locator("main#main");
  await expect(main).toContainText("Verantwortlicher");
  await expect(main).toContainText("Hetzner");
  await expect(main).toContainText("Dennis Müller");
});

test("SAFETY-GUARD: /datenschutz enthält keine Entwurfs-/Platzhalter-Marker", async ({
  page,
}) => {
  await page.goto("/datenschutz");

  const body = (await page.locator("body").textContent()) ?? "";

  // Entwurf-Banner darf nicht live sein.
  expect(body).not.toContain("Entwurf — bitte");
  expect(body).not.toContain("bitte einsetzen");
  // Eckige-Klammer-Platzhalter aus dem Entwurf.
  expect(body).not.toContain("[Datum");
  expect(body).not.toContain("[Anschrift");
});

test("beide Rechtsseiten setzen meta robots noindex, follow", async ({
  page,
}) => {
  for (const path of ["/impressum", "/datenschutz"]) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, follow",
    );
  }
});

test("Footer-Links zu Impressum/Datenschutz erscheinen auf jeder Seite", async ({
  page,
}) => {
  for (const path of ["/", "/impressum", "/datenschutz"]) {
    await page.goto(path);
    const footer = page.locator("#footer");
    await expect(
      footer.getByRole("link", { name: "Impressum" }),
    ).toHaveAttribute("href", "/impressum");
    await expect(
      footer.getByRole("link", { name: "Datenschutz" }),
    ).toHaveAttribute("href", "/datenschutz");
  }
});

test("von der Startseite aus sind beide Rechtsseiten erreichbar", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .locator("#footer")
    .getByRole("link", { name: "Impressum" })
    .click();
  await expect(page).toHaveURL(/\/impressum\/?$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Impressum");

  await page.goto("/");
  await page
    .locator("#footer")
    .getByRole("link", { name: "Datenschutz" })
    .click();
  await expect(page).toHaveURL(/\/datenschutz\/?$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Datenschutzerklärung",
  );
});

test('„Zur Startseite"-Link führt zurück zur One-Page', async ({ page }) => {
  await page.goto("/impressum");
  await page.getByRole("link", { name: /Zur Startseite/ }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Dank Dennis",
  );
});

test("keine Konsolen-Fehler auf den Rechtsseiten", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  for (const path of ["/impressum", "/datenschutz"]) {
    await page.goto(path, { waitUntil: "networkidle" });
  }

  expect(
    consoleErrors,
    `Konsolen-Fehler: ${consoleErrors.join(" | ")}`,
  ).toEqual([]);
});
