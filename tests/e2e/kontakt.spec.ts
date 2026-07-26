import { test, expect } from "@playwright/test";

/**
 * Kontakt-Test (M8) — prüft die Sektion „Sag Hallo":
 *  1. Heading und Text-Kernphrase sind vorhanden.
 *  2. Alle vier Kontakt-Buttons (E-Mail/Instagram/LinkedIn/WhatsApp) sind da …
 *  3. … E-Mail/Instagram/WhatsApp als echte Links (extern mit target/rel),
 *     LinkedIn (noch kein Account) als ausgegrauter „bald"-Platzhalter.
 *  4. Keine Konsolen-Fehler.
 * Läuft per playwright.config.ts auf Desktop- UND Mobile-Viewport (DoD: mobil + Desktop).
 */

const LINKS = [
  { label: "E-Mail", href: "mailto:gigasetdennis@gmail.com", external: false },
  {
    label: "Instagram",
    href: "https://www.instagram.com/dennismuller77",
    external: true,
  },
  { label: "WhatsApp", href: "https://wa.me/dennismuller77", external: true },
];
const LABELS = ["E-Mail", "Instagram", "LinkedIn", "WhatsApp"];

test("Heading und Text sind vorhanden", async ({ page }) => {
  await page.goto("/");

  const contact = page.locator("#kontakt");
  await expect(contact.locator("h2")).toHaveText("Sag Hallo");
  await expect(contact).toContainText("willst du einfach mal");

  // M8 hat keine Platzhalter-Notiz mehr.
  await expect(contact.locator(".placeholder-note")).toHaveCount(0);
});

test("alle vier Kontakt-Buttons sind vorhanden und tragen ihr Icon", async ({
  page,
}) => {
  await page.goto("/");

  const buttons = page.locator("#kontakt .contact__btn");
  await expect(buttons).toHaveCount(LABELS.length);

  for (const label of LABELS) {
    const btn = page.locator("#kontakt .contact__btn", { hasText: label });
    await expect(btn).toBeVisible();
    await expect(btn.locator("svg")).toHaveCount(1);
  }
});

test("E-Mail, Instagram und WhatsApp verlinken korrekt", async ({ page }) => {
  await page.goto("/");

  for (const { label, href, external } of LINKS) {
    const link = page.locator("#kontakt a.contact__btn", { hasText: label });
    await expect(link).toHaveAttribute("href", href);
    // Kein Platzhalter mehr …
    await expect(link).not.toHaveAttribute("data-placeholder", /.*/);
    // … und externe Ziele öffnen sicher in einem neuen Tab.
    if (external) {
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
    } else {
      await expect(link).not.toHaveAttribute("target", /.*/);
    }
  }
});

test("LinkedIn ist ausgegraut statt verlinkt (Account existiert noch nicht)", async ({
  page,
}) => {
  await page.goto("/");

  const linkedin = page.locator("#kontakt .contact__btn", {
    hasText: "LinkedIn",
  });
  // Kein Link, sondern markierter Platzhalter …
  await expect(linkedin).toHaveJSProperty("tagName", "SPAN");
  await expect(linkedin).toHaveAttribute("data-placeholder", "");
  await expect(linkedin).toHaveAttribute("aria-disabled", "true");
  await expect(linkedin).toHaveClass(/contact__btn--soon/);
  // … mit sichtbarem „bald"-Marker.
  await expect(linkedin.locator(".contact__soon")).toContainText("bald");
  // Ausgegraut: Text- und Icon-Farbe unterscheiden sich vom aktiven LinkedIn-Blau.
  const color = await linkedin.evaluate((el) => getComputedStyle(el).color);
  expect(color).not.toBe("rgb(10, 102, 194)");
  // Hover ändert nichts (kein Fill wie bei den aktiven Buttons).
  const before = await linkedin.evaluate(
    (el) => getComputedStyle(el).backgroundColor,
  );
  await linkedin.hover();
  await expect
    .poll(() => linkedin.evaluate((el) => getComputedStyle(el).backgroundColor))
    .toBe(before);
});

test("Kontakt-Foto ist optimiert eingebunden (AVIF/WebP, srcset, Alt)", async ({
  page,
}) => {
  await page.goto("/");

  const media = page.locator("#kontakt .contact__media");
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
