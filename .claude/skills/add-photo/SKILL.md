---
name: add-photo
description: Bindet ein Foto optimiert in eine Sektion von dankdennis.de ein — Quellbild nach src/assets/images/, Einbau per astro:assets <Image> mit Alt-Text und sinnvollen sizes, Layout-Check im Browser. Nutzen, wenn ein echtes Foto (Werkstatt/Porträt/Fußball) hinzugefügt oder ein Platzhalter ersetzt wird.
---

# add-photo

Stellt sicher, dass Bilder **optimiert** (WebP/AVIF, responsive srcset) ausgeliefert werden —
nie roh. Fotos werden gemeinsam mit dem Nutzer ausgewählt (gebündelt in Meilenstein M10).

## Foto-Legende (aus docs/)

- **foto1** = Werkstatt-Action (Hero, Werkstatt)
- **foto2** = lachendes Porträt (Über)
- **foto3** = Fußball-Feldaction (Fußball)

## Schritte

1. **Quellbild ablegen** in `src/assets/images/` (z. B. `werkstatt-action.jpg`).
   - Hochformat bevorzugt (passt zu den Split-Layouts).
   - astro:assets übernimmt Kompression/Format — kein manuelles Squoosh nötig.

2. **Einbauen mit `<Image>`** (nie rohe `<img>` für Fotos):

   ```astro
   ---
   import { Image } from "astro:assets";
   import werkstatt from "../assets/images/werkstatt-action.jpg";
   ---

   <Image
     src={werkstatt}
     alt="Dennis in der Werkstatt bei einer Schwalbenschwanz-Verbindung"
     sizes="(max-width: 768px) 100vw, 50vw"
     widths={[400, 800, 1200]}
     loading="lazy"
   />
   ```

   - **Alt-Text**: beschreibend, deutsch (A11y + SEO).
   - **sizes/widths**: am Layout orientieren (Split = ~50vw auf Desktop, 100vw mobil).
   - **loading="lazy"** für Bilder below the fold; Hero-Bild darf `eager` sein.

3. **Browser-Check** (Skill `browser-test`): Layout mobil + Desktop, kein CLS, scharf.

4. **Verifizieren**: `npm run check` grün; im Build liegt optimiertes WebP/AVIF unter
   `dist/_astro/` (nicht das Originalformat 1:1).
