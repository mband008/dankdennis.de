import { test, expect, type Request } from "@playwright/test";

/**
 * Smoke-Test (M0) — beweist, dass das Fundament trägt:
 *  1. Seite lädt und liefert den erwarteten <title>.
 *  2. Die Kern-Headline ist vorhanden.
 *  3. KEINE Konsolen-Fehler.
 *  4. KEINE externen Font-Requests (Datenschutz-/Self-Hosting-Garantie):
 *     nichts geht an fonts.googleapis.com / fonts.gstatic.com oder andere Fremd-Hosts.
 */

const EXTERNAL_FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

test("Startseite lädt mit korrektem Titel und Headline", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.goto("/");

  await expect(page).toHaveTitle(/Dank Dennis/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Dank Dennis",
  );

  expect(
    consoleErrors,
    `Konsolen-Fehler: ${consoleErrors.join(" | ")}`,
  ).toEqual([]);
});

test("keine externen Font-Requests (Fonts sind self-hosted)", async ({
  page,
}) => {
  const externalFontRequests: string[] = [];

  page.on("request", (req: Request) => {
    const url = req.url();
    const isExternalFontHost = EXTERNAL_FONT_HOSTS.some((host) =>
      url.includes(host),
    );
    const isFontResource = req.resourceType() === "font";
    const isCrossOriginFont =
      isFontResource && !url.startsWith("http://localhost");
    if (isExternalFontHost || isCrossOriginFont) externalFontRequests.push(url);
  });

  await page.goto("/", { waitUntil: "networkidle" });

  expect(
    externalFontRequests,
    `Externe Font-Requests gefunden: ${externalFontRequests.join(", ")}`,
  ).toEqual([]);
});
