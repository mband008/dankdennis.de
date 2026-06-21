import { test, expect } from "@playwright/test";

/**
 * A11y-Feinschliff-Test (M12) — prüft die Barrierefreiheits-Grundlagen:
 *  1. Genau eine <h1>; Heading-Hierarchie ohne übersprungene Ebenen.
 *  2. Landmarks: <main id="main"> und <footer> vorhanden.
 *  3. Skip-Link: erste fokussierbare Stelle, zielt auf #main, wird bei Fokus sichtbar.
 *  4. Kontrast-Fix Sport-Zone: Fußball-Kicker ist Off-White (nicht das zu blasse Gelb auf Rot).
 */

test("genau eine h1 und lückenlose Heading-Hierarchie", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("h1")).toHaveCount(1);

  const levels = await page
    .locator("h1, h2, h3, h4, h5, h6")
    .evaluateAll((els) => els.map((el) => Number(el.tagName[1])));

  expect(levels[0]).toBe(1);
  // Keine Ebene überspringt mehr als +1 gegenüber der vorigen.
  for (let i = 1; i < levels.length; i++) {
    expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
  }
});

test("Landmarks: main#main und footer vorhanden", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("main#main")).toHaveCount(1);
  await expect(page.locator("footer")).toHaveCount(1);
});

test("Skip-Link: erste Tab-Station, zielt auf #main, bei Fokus sichtbar", async ({
  page,
}) => {
  await page.goto("/");

  const skip = page.locator(".skip-link");
  await expect(skip).toHaveAttribute("href", "#main");

  // Versteckt (oberhalb des Viewports) bis Fokus.
  const hiddenTop = await skip.evaluate((el) => el.getBoundingClientRect().top);
  expect(hiddenTop).toBeLessThan(0);

  // Erste Tab-Station ist der Skip-Link.
  await page.keyboard.press("Tab");
  const focusedClass = await page.evaluate(
    () => document.activeElement?.className,
  );
  expect(focusedClass).toContain("skip-link");

  // Bei Fokus ins Sichtfeld gefahren (Slide-In abwarten → pollen statt Momentaufnahme).
  await expect
    .poll(() => skip.evaluate((el) => el.getBoundingClientRect().top))
    .toBeGreaterThanOrEqual(0);
});

test("Kontrast Sport-Zone: Fußball-Kicker ist Off-White, nicht Gelb", async ({
  page,
}) => {
  await page.goto("/");

  const kicker = page.locator("#fussball .kicker");
  await expect(kicker).toContainText("ASG Vorwärts Dessau");

  const color = await kicker.evaluate((el) => getComputedStyle(el).color);
  // Off-White-Token #f7f3ec → rgb(247, 243, 236); nicht das Gelb #f2b705.
  expect(color).toBe("rgb(247, 243, 236)");
});
