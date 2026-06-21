// @ts-check
import { defineConfig } from "astro/config";

// dankdennis.de — statischer Output (kein SSR), passt zum Coolify-Static-Deploy.
// astro:assets (<Image>) ist in Astro standardmäßig aktiv und übernimmt die
// automatische Bildoptimierung (responsive srcset, WebP/AVIF, lazy loading).
export default defineConfig({
  // Deploy-/Canonical-URL (steuert canonical + og:url/og:image/twitter:image).
  site: "https://dankdennis.sontypiminternet.de",
  output: "static",
  // Fester Dev-Port; Playwright hängt sich für E2E an `astro preview` (s. playwright.config.ts).
  server: { port: 4321 },
});
