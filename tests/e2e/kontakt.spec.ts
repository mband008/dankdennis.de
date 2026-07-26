import { test, expect } from "@playwright/test";

/**
 * Kontakt-Test (M8) — prüft die Sektion „Sag Hallo":
 *  1. Heading und Text-Kernphrase sind vorhanden.
 *  2. Alle vier Kontakt-Buttons (E-Mail/Instagram/LinkedIn/WhatsApp) sind da …
 *  3. … E-Mail/Instagram/LinkedIn als echte Links (extern mit target/rel).
 *  4. WhatsApp trägt Dennis' Telefonnummer → maskiert: kein href im HTML, kein href
 *     beim Hovern (sonst verriete die Statuszeile die Nummer), erst bei Klick-/
 *     Tastatur-Absicht wird daraus ein echter Link.
 *  5. Keine Konsolen-Fehler.
 * Läuft per playwright.config.ts auf Desktop- UND Mobile-Viewport (DoD: mobil + Desktop).
 */

const LINKS = [
  { label: "E-Mail", href: "mailto:gigasetdennis@gmail.com", external: false },
  {
    label: "Instagram",
    href: "https://www.instagram.com/dennismuller77",
    external: true,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/dennis-m%C3%BCller-2bb187425/",
    external: true,
  },
];
const WA_HREF = "https://wa.me/4917637633091";
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

test("E-Mail, Instagram und LinkedIn verlinken korrekt", async ({ page }) => {
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

test("Telefonnummer steht nicht im ausgelieferten HTML (Spam-Schutz)", async ({
  page,
}) => {
  const response = await page.goto("/");
  const html = (await response?.text()) ?? "";

  // Der WhatsApp-Link darf erst per Skript entstehen, nicht im Quelltext stehen.
  expect(html).not.toContain("4917637633091");
  expect(html).not.toContain("+49 176 37633091");
  expect(html).not.toContain("wa.me/49");
});

test("WhatsApp-Link entsteht nicht beim Laden und nicht beim Hovern", async ({
  page,
}) => {
  await page.goto("/");
  const wa = page.locator("#kontakt a.contact__btn", { hasText: "WhatsApp" });

  // Direkt nach dem Laden: noch kein href — sonst stünde die Nummer im DOM.
  await expect(wa).toBeVisible();
  await expect(wa).not.toHaveAttribute("href", /.*/);
  await expect(wa).toHaveAttribute("data-href", /.+/);

  // Hovern allein darf nichts scharfschalten (Statuszeile bliebe sonst verräterisch).
  await wa.hover();
  await expect(wa).not.toHaveAttribute("href", /.*/);
  expect(await page.locator("#kontakt").textContent()).not.toContain("7633091");

  // Rechtsklick ebenfalls nicht — so kommt „Untersuchen"/Kontextmenü nicht an die
  // Nummer, ohne dass jemand den Link überhaupt benutzen wollte.
  await wa.click({ button: "right" });
  await expect(wa).not.toHaveAttribute("href", /.*/);
  await expect(wa).toHaveAttribute("data-href", /.+/);
});

test("WhatsApp-Link wird bei Klick- und bei Tastatur-Absicht scharf", async ({
  page,
}) => {
  // (a) Maus/Touch: pointerdown genügt, der anschließende Klick navigiert normal.
  await page.goto("/");
  let wa = page.locator("#kontakt a.contact__btn", { hasText: "WhatsApp" });
  await wa.dispatchEvent("pointerdown");
  await expect(wa).toHaveAttribute("href", WA_HREF);
  await expect(wa).toHaveAttribute("target", "_blank");
  await expect(wa).toHaveAttribute("rel", /noopener/);
  await expect(wa).not.toHaveAttribute("data-href", /.*/);

  // (b) Tastatur: der Button ist fokussierbar, Fokus schaltet scharf → Enter navigiert.
  await page.goto("/");
  wa = page.locator("#kontakt a.contact__btn", { hasText: "WhatsApp" });
  await wa.focus();
  await expect(wa).toBeFocused();
  await expect(wa).toHaveAttribute("href", WA_HREF);
});

test("Klick auf WhatsApp öffnet den wa.me-Link in einem neuen Tab", async ({
  page,
  context,
}) => {
  // wa.me leitet sofort auf api.whatsapp.com weiter — abfangen, damit der Test
  // offline läuft und die aufgerufene URL unverfälscht prüfbar bleibt.
  await context.route("https://wa.me/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "ok" }),
  );

  await page.goto("/");
  const wa = page.locator("#kontakt a.contact__btn", { hasText: "WhatsApp" });

  const popup = context.waitForEvent("page");
  await wa.click();
  const opened = await popup;
  await opened.waitForLoadState();

  expect(opened.url()).toBe(WA_HREF);
  await opened.close();
});

test("kein Kontaktweg ist mehr Platzhalter oder ausgegraut", async ({
  page,
}) => {
  await page.goto("/");

  const contact = page.locator("#kontakt");
  await expect(contact.locator("[data-placeholder]")).toHaveCount(0);
  await expect(contact.locator(".contact__btn--soon")).toHaveCount(0);
  await expect(contact.locator(".contact__soon")).toHaveCount(0);
  await expect(contact.getByText("bald")).toHaveCount(0);
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
