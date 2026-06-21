# dankdennis.de — Foto-Plan (Meilenstein M10)

_Verbindliche Zuordnung der echten Fotos zu den Sektionen. Quelle der Wahrheit für die
Foto-Auswahl. Inhalte/Texte bleiben in `docs/dankdennis_bauplan.md`._

_Umsetzungsstand: in M10 umgesetzt. Die genutzten Fotos liegen jetzt in
`src/assets/images/` und werden über `astro:assets` (`<Picture>`) ausgeliefert._

## 0. Quelle & Optimierung — WICHTIG, zuerst lesen

- Originalfotos lagen ursprünglich in **`public/AI Bilder/`** (Ordnername mit Leerzeichen).
- **Bilder in `public/` werden von `astro:assets` NICHT optimiert** — sie werden nur 1:1 in
  den Build kopiert (kein WebP/AVIF, kein `srcset`, kein Resize).
- Deshalb in M10: die genutzten Fotos nach **`src/assets/images/`** verschieben und dort per
  `import` + `<Picture>` (astro:assets) einbinden. Nur so greifen WebP/AVIF, `srcset` und
  `loading="lazy"`. **Keine rohen `<img>` aus `public/` für diese Fotos.**
- **Dateinamen exakt — Casing relevant!** Die meisten heißen `carp` (klein), aber
  `Dennis_Carp_neutral_cam.png` und `Dennis_Carp_draw_cam.png` haben ein **großes `Carp`**.

## 1. Zuordnung pro Sektion

### Hero — EIN Bild (rechte Spalte, Hochformat)

- **Datei:** `Dennis_neutral_open_hand.png`
- **Alt:** „Dennis lächelt mit offener, einladender Handgeste"
- Hinweis: kühleres Studio-Bild auf warmem Hero-Grund → farbliche Angleichung (warmer
  Grade) ist **M11**, nicht M10. In M10 nur platzieren. (Above the fold → eager geladen.)

### Über („Hi, ich bin Dennis") — EIN Bild (linke Spalte)

- **Datei:** `Dennis_Carp_neutral_cam.png` _(großes „Carp")_
- **Alt:** „Dennis in seiner Werkstatt, mit Lederschürze, lächelt in die Kamera"
- Alternative bei Bedarf: `Dennis_carp_plank_cam.png`.

### In der Werkstatt — GALERIE (`auto-fit`-Grid, je ein `<figure>`)

Vier Action-Shots in **Prozess-Reihenfolge**:

1. `Dennis_carp_draw.png` — „Dennis zeichnet mit Bleistift eine Linie auf ein Brett an"
2. `Dennis_carp_planing.png` — „Dennis hobelt ein Werkstück mit dem Handhobel"
3. `Dennis_carp_assemble.png` — „Dennis fügt eine Holzbox mit Schwalbenschwanz-Verbindung"
4. `Dennis_carp_grind.png` — „Dennis schleift ein Brett mit dem Exzenterschleifer"

### Abseits der Werkstatt (Fußball) — GALERIE, Zwei-Kapitel-Story (Tor → Feld)

Sektion von Einzelbild **auf Galerie umgebaut**. Rote `tone-sport`-Zone + Gelb-Akzent
beibehalten; verspielter Charakter (leichter Tilt / Akzentrahmen) erhalten.

1. `Dennis_fb_keeping.png` — **Aufhänger** — „Dennis hält als Torwart einen Ball, Flugparade"
2. `Dennis_fb_gk.png` — „Dennis als Torwart in Grundstellung im Tor"
3. `Dennis_fb_strike.png` — „Dennis am Ball im roten Trikot der ASG Vorwärts Dessau"
4. `Dennis_fb_midfield.png` — „Dennis dribbelt im roten Trikot über den Platz"

- Optionale Caption-Idee (nicht umgesetzt): „Letzte Saison im Tor, nächste wieder im Feld."

### Kontakt („Sag Hallo") — EIN Bild (NEU)

- **Datei:** `Dennis_neutral_hand_heart.png`
- **Alt:** „Dennis mit der Hand auf dem Herzen, dankbare Geste"
- Dezent (rundes Porträt) über „Sag Hallo" integriert.

## 2. Reserviert / Spare — in M10 NICHT verwendet

_Liegen versioniert unter `src/assets/images/_spare/` (unimportiert → werden NICHT
ausgeliefert; bewusst nicht in `public/`, weil `public/` ungenutzt mit deployt würde)._

- `Dennis_neutral_thumb_up_closer.png` → reserviert als **OG-/Share-Bild in M11**.
- Spare: `Dennis_neutral_thumb_up.png`, `Dennis_carp_plank_cam.png`,
  `Dennis_Carp_draw_cam.png` _(großes „Carp")_, `Dennis_carp_football_cam.png`
  _(Werkstatt + Fußball + Blickkontakt — starkes Reserve-/Brücken-Bild)_.

## 3. NICHT Teil von M10 (kommt später)

- **Scroll-Reveal-Animationen** (Fotos animieren beim Reinscrollen ein) → eigener
  Bewegungs-Meilenstein nach M10.
- Optionale **Lightbox** (Klick-zum-Vergrößern) → mit dem Bewegungs-Meilenstein.
- **Farb-Angleichung** der kühlen Studio-Porträts (warmer Grade) + **OG-Image** → M11.

## 4. Definition of Done (M10) — erfüllt

- Alle zugeordneten Fotos via `astro:assets`/`<Picture>` aus `src/assets/images/` eingebunden
  (keine rohen `<img>` aus `public/`).
- Werkstatt **und** Fußball zeigen ihre Galerie; Hero / Über / Kontakt je ihr Bild.
- Optimierte Auslieferung nachweisbar (AVIF/WebP + `srcset`; Browser lädt AVIF),
  `loading="lazy"` für Bilder unterhalb des Folds (Hero `eager`).
- Aussagekräftige Alt-Texte gesetzt.
- Responsive (mobil + Desktop), keine Konsolen-Fehler, `npm run verify` grün (68 Tests).
- Betroffene Playwright-Specs aktualisiert (Bild/Alt/`srcset`/AVIF-Quelle/Galerie-Struktur).
