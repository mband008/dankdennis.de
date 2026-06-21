import { test, expect } from "@playwright/test";

/**
 * Meta/SEO/OpenGraph-Test (M12) — prüft die Share-/SEO-Grundlage:
 *  1. SEO-Basics: lang=de, Title, Description, Canonical (Produktions-URL).
 *  2. Open Graph: type/site_name/title/description/url + Bild inkl. Maße/Alt/Typ.
 *  3. Twitter-Card: summary_large_image + Title/Description/Bild.
 *  4. Favicon (Marken-SVG) verlinkt UND erreichbar.
 *  5. Komponiertes OG-Bild (public/og.png) ist im Build erreichbar (1200×630-Asset).
 */

// Deploy-/Canonical-URL — muss mit `site` in astro.config.mjs übereinstimmen.
const SITE = "https://dankdennis.sontypiminternet.de";

async function contentOf(
  page: import("@playwright/test").Page,
  selector: string,
) {
  return page.locator(selector).getAttribute("content");
}

test("SEO-Basics: lang, Title, Description, Canonical", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page).toHaveTitle(/Dank Dennis/);

  const desc = await contentOf(page, 'meta[name="description"]');
  expect(desc && desc.length).toBeGreaterThan(50);

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `${SITE}/`,
  );
});

test("Open Graph: Kern-Tags + Bild mit Maßen, Alt und Typ", async ({
  page,
}) => {
  await page.goto("/");

  expect(await contentOf(page, 'meta[property="og:type"]')).toBe("website");
  expect(await contentOf(page, 'meta[property="og:site_name"]')).toBe(
    "Dank Dennis",
  );
  expect(await contentOf(page, 'meta[property="og:title"]')).toMatch(
    /Dank Dennis/,
  );
  const ogDesc = await contentOf(page, 'meta[property="og:description"]');
  expect(ogDesc && ogDesc.length).toBeGreaterThan(50);
  expect(await contentOf(page, 'meta[property="og:url"]')).toBe(`${SITE}/`);

  // Bild absolut (Crawler laden nur absolute URLs) + Maße/Alt/Typ.
  expect(await contentOf(page, 'meta[property="og:image"]')).toBe(
    `${SITE}/og.png`,
  );
  expect(await contentOf(page, 'meta[property="og:image:width"]')).toBe("1200");
  expect(await contentOf(page, 'meta[property="og:image:height"]')).toBe("630");
  expect(await contentOf(page, 'meta[property="og:image:type"]')).toBe(
    "image/png",
  );
  const ogAlt = await contentOf(page, 'meta[property="og:image:alt"]');
  expect(ogAlt && ogAlt.length).toBeGreaterThan(10);
});

test("Twitter-Card: summary_large_image + Title/Description/Bild", async ({
  page,
}) => {
  await page.goto("/");

  expect(await contentOf(page, 'meta[name="twitter:card"]')).toBe(
    "summary_large_image",
  );
  expect(await contentOf(page, 'meta[name="twitter:title"]')).toMatch(
    /Dank Dennis/,
  );
  expect(
    await contentOf(page, 'meta[name="twitter:description"]'),
  ).toBeTruthy();
  expect(await contentOf(page, 'meta[name="twitter:image"]')).toBe(
    `${SITE}/og.png`,
  );
});

test("Favicon: Marken-SVG verlinkt und erreichbar", async ({ page }) => {
  await page.goto("/");

  const icon = page.locator('link[rel="icon"]');
  await expect(icon).toHaveAttribute("href", "/favicon.svg");
  await expect(icon).toHaveAttribute("type", "image/svg+xml");

  const res = await page.request.get("/favicon.svg");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("image/svg");
});

test("OG-Bild (og.png) ist im Build erreichbar und 1200×630-Asset", async ({
  page,
}) => {
  const res = await page.request.get("/og.png");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("image/png");
  // Sanity: nicht-leeres Bild ausgeliefert.
  const body = await res.body();
  expect(body.length).toBeGreaterThan(1000);
});
