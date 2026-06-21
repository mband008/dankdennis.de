import { test, expect, type Locator } from "@playwright/test";

/**
 * Scroll-Reveal-Test (M11) — prüft das sanfte Einblenden beim Reinscrollen:
 *  1. Mit erlaubter Bewegung: Sektions-Inhalte unter dem Fold starten versteckt (opacity 0)
 *     und werden beim Reinscrollen sichtbar (.is-visible, opacity 1). Galerie-Fotos stellen
 *     ihren Stagger über gestaffelte transition-delay-Werte ein.
 *  2. prefers-reduced-motion: reduce → alle Inhalte sofort sichtbar, KEIN Transform/Fade.
 *  3. No-JS-Gegenprobe: ohne JS bleibt nichts versteckt (Inhalt sofort sichtbar).
 *  4. Counter: nur Überschrift/Untertext werden revealt — die große Zahl NICHT (kein data-reveal).
 *  5. Keine Konsolen-Fehler.
 * Läuft per playwright.config.ts auf Desktop- UND Mobile-Viewport (DoD: mobil + Desktop).
 */

const opacityOf = (locator: Locator) =>
  locator.evaluate((el) => getComputedStyle(el).opacity);

const transformOf = (locator: Locator) =>
  locator.evaluate((el) => getComputedStyle(el).transform);

test("Inhalte erscheinen beim Reinscrollen (versteckt → sichtbar)", async ({
  page,
}) => {
  await page.goto("/");

  // js-reveal-Gate ist gesetzt (JS + IntersectionObserver vorhanden).
  await expect(page.locator("html")).toHaveClass(/js-reveal/);

  // Kontakt liegt klar unter dem Fold → Startzustand versteckt, noch nicht revealt.
  const heading = page.locator("#kontakt h2");
  await expect(heading).not.toHaveClass(/is-visible/);
  await expect.poll(() => opacityOf(heading)).toBe("0");

  // Reinscrollen löst das Reveal aus → sichtbar und voll deckend.
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toHaveClass(/is-visible/);
  await expect.poll(() => opacityOf(heading)).toBe("1");
});

test("Galerie-Fotos sind gestaffelt und werden beim Reinscrollen sichtbar", async ({
  page,
}) => {
  await page.goto("/");

  const items = page.locator("#werkstatt .workshop__item");
  await expect(items).toHaveCount(4);

  // Stagger: jedes Bild hat einen größeren transition-delay als das vorige.
  const delays = await items.evaluateAll((els) =>
    els.map((el) => getComputedStyle(el).transitionDelay),
  );
  const ms = delays.map((d) => parseFloat(d) * (d.endsWith("ms") ? 1 : 1000));
  for (let i = 1; i < ms.length; i++) {
    expect(ms[i]).toBeGreaterThan(ms[i - 1]);
  }

  // Jedes Item einzeln in den Blick holen (mobil einspaltig) → wird sichtbar.
  for (let i = 0; i < 4; i++) {
    await items.nth(i).scrollIntoViewIfNeeded();
    await expect(items.nth(i)).toHaveClass(/is-visible/);
  }
});

test("Counter: Überschrift/Untertext werden revealt, die Zahl NICHT", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.locator("#counter h2")).toHaveAttribute("data-reveal", "");
  await expect(page.locator("#counter .counter__sub")).toHaveAttribute(
    "data-reveal",
    "",
  );
  // Die große Zahl behält ihren Count-Up und trägt kein data-reveal.
  await expect(page.locator("#counter .counter__number")).toHaveCount(1);
  await expect(
    page.locator("#counter .counter__number[data-reveal]"),
  ).toHaveCount(0);
});

test("mit prefers-reduced-motion: reduce ist alles sofort sichtbar (kein Fade/Transform)", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  // Ohne Scrollen: ein Element tief unten ist voll sichtbar und nicht verschoben.
  const heading = page.locator("#kontakt h2");
  await expect.poll(() => opacityOf(heading)).toBe("1");
  expect(await transformOf(heading)).toBe("none");
});

test.describe("ohne JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("No-JS-Gegenprobe: Inhalte sind sichtbar", async ({ page }) => {
    await page.goto("/");

    // Kein js-reveal-Gate → Startzustand greift nie → Inhalt voll sichtbar, nicht verschoben.
    await expect(page.locator("html")).not.toHaveClass(/js-reveal/);
    const heading = page.locator("#kontakt h2");
    await expect.poll(() => opacityOf(heading)).toBe("1");
    expect(await transformOf(heading)).toBe("none");
  });
});

test("keine Konsolen-Fehler bei den Scroll-Reveals", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.goto("/", { waitUntil: "networkidle" });
  // Durch die Seite scrollen, damit alle Observer feuern.
  await page.locator("#footer").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  expect(
    consoleErrors,
    `Konsolen-Fehler: ${consoleErrors.join(" | ")}`,
  ).toEqual([]);
});
