# dankdennis.de — Umsetzungsstand M1–M9

_Stand: 2026-06-21. Diese Datei fasst zusammen, was bis einschließlich Meilenstein M9
gebaut wurde — als Gesprächsgrundlage (z. B. mit einer KI). Quelle der Wahrheit für
**Inhalte** bleiben `docs/dankdennis_bauplan.md` und `docs/dankdennis_brainstorming.md`;
die Reihenfolge/Abnahme steht in `ROADMAP.md`._

## 1. Projekt in einem Satz

Persönliche One-Page-Visitenkarte für **Dennis** (gelernter Tischler im Ladenbau,
Feldspieler bei ASG Vorwärts Dessau). Zielgruppe: potenzielle Arbeitgeber **und** neue
Bekanntschaften. Kein Verkauf, kein Auftrags-Pitch. Markenkern: „Verlässlicher Teamplayer,
der anpackt und Probleme löst." Roter Faden: das Meme **„Dank Dennis"**. Ton:
verspielt-augenzwinkernd, aber glaubwürdig.

## 2. Tech-Stack & Architektur

- **Astro** (statischer Output, kein SSR), **TypeScript** für Client-Skripte.
- **Reines CSS** mit **Design-Tokens** in `src/styles/tokens.css` — keine UI-Library.
  Regel: im Code immer Tokens, nie Rohwerte (Hex/px/Font-Namen) hartkodieren.
- **Fonts self-hosted** über `@fontsource-variable` (Bricolage Grotesque = Display,
  Inter = Fließtext) — keine externen Font-Requests (DSGVO/Performance; im Smoke-Test geprüft).
- **Client-Interaktionen** rein client-seitig, kein Backend:
  - `canvas-confetti` (self-hosted via npm) für den Konfetti-Effekt.
  - `IntersectionObserver` für den Count-Up-Zähler.
- **`prefers-reduced-motion: reduce`** wird durchgängig respektiert (zentrale Regeln in
  `src/styles/global.css`, zusätzlich pro Interaktion via `matchMedia`).
- **Bilder**: aktuell **CSS-Platzhalter-Boxen**; echte Fotos kommen gebündelt in M10 über
  `astro:assets` (`<Image>`).

### Verzeichnisstruktur (relevant)

```
src/
  layouts/Base.astro          # <head>/Meta/OG, Font- + CSS-Imports, <slot/>
  pages/index.astro           # setzt die 7 Sektionen in docs-Reihenfolge zusammen
  components/
    Hero.astro                # M2 + M3 (Konfetti-Button)
    About.astro               # M4
    Workshop.astro            # M5
    Football.astro            # M6
    Counter.astro             # M7
    Contact.astro             # M8 (+ gebrandete Buttons)
    Footer.astro              # M9
  scripts/
    confetti.ts               # M3 — globaler [data-confetti]-Handler
    counter.ts                # M7 — Count-Up via IntersectionObserver
  styles/
    tokens.css                # Farben, Typo, Spacing, Motion, Brand-Tokens
    global.css                # Reset, Layout-Utilities, Tonzonen, Motion-Regeln
    fonts.css                 # @font-face (self-hosted)
tests/e2e/                    # Playwright-Specs, je Sektion eine Datei
```

## 3. Design-System

### Farbwelt (Tokens)

- **Primär Rot** `#c81e1e` (Vereinsrot ASG), **Akzent Gelb** `#f2b705` (sparsam).
- **Basis** warmes Off-White `#f7f3ec`, **dunkle Sektionen** Espresso `#2a211b`.
- **Text** `#1c1916` auf hell, Off-White auf dunkel.
- **Tonzonen** (in `global.css`) je Sektion:
  - `tone-warm` — hell/holzig (Hero, Über, Kontakt)
  - `tone-wood` — dunkel/Espresso, Gelb-Akzent (Werkstatt, Counter, Footer)
  - `tone-sport` — Vereinsrot, Gelb-Akzent (Fußball)
- **Brand-Tokens** (nur Kontakt-Buttons, bewusst außerhalb der Markenpalette):
  `--brand-email` (= Rot), `--brand-instagram` (+ Verlauf), `--brand-linkedin`,
  `--brand-whatsapp`.

### Typografie & Layout

- Fluid Type-Scale via `clamp()` (`--fs-100` … `--fs-600`).
- Container `max-width: 72rem`, fluides Padding.
- Split-Layouts (Bild/Text) per CSS-Grid; mobil einspaltig, Bild via `order` nach oben.

### Motion / Barrierefreiheit

- Motion-Tokens werden bei `reduce` global auf `0` gesetzt; Transitions/Animationen als
  Sicherheitsnetz neutralisiert.
- Konfetti löst bei `reduce` **nicht** aus; der Counter zeigt bei `reduce` **sofort** den
  Endwert statt hochzuzählen.
- Sichtbarer Fokus (`:focus-visible`), `aria-hidden` für rein dekorative Grafiken,
  No-JS-Fallbacks (Counter-Endwert steht im HTML).

## 4. Die Sektionen / Meilensteine

Reihenfolge der Seite = M2 → M9 (Footer). Jede Sektion hat einen eigenen Playwright-Spec.

### M1 — Layout-Grundgerüst ✅

Alle 7 Sektionen als Komponenten in docs-Reihenfolge, responsiver Container, Tonzonen als
CSS-Grundlage, dynamisches Jahr im Footer. Test prüft Anker, Reihenfolge, Headings.

### M2 — Hero ✅ (`Hero.astro`)

- Split-Layout: Text links / Platzhalterbild (foto1, Hochformat) rechts; mobil Bild oben.
- Headline „Problem? Dank Dennis." (einzige `<h1>`), Untertitel, Kicker „dankdennis.de".
- Button „Dank Dennis!" (in M2 noch ohne Logik).

### M3 — Konfetti-Interaktion ✅ (`scripts/confetti.ts`)

- `canvas-confetti` (self-hosted) am `[data-confetti]`-Button; **Farben aus den Tokens**
  gelesen (kein Hardcode). Hinweis „(probier's aus)".
- `reduce` → kein Konfetti (live pro Klick via `matchMedia` geprüft).
- Der Handler bindet **alle** `[data-confetti]` global → später vom Footer mitgenutzt.

### M4 — Über (Wer ist Dennis) ✅ (`About.astro`)

- Split: Platzhalter-Porträt (foto2) **links**, Text rechts (spiegelt den Hero); mobil
  Bild oben. Heading „Hi, ich bin Dennis." + 2 Absätze (Schreiner-Team/Ladenbau + Meme-Story).

### M5 — Werkstatt ✅ (`Workshop.astro`)

- Intro (Heading „In der Werkstatt" + kurzer Text) über einer **galerie-fähigen**
  Bild-Struktur (`.workshop__gallery`, `auto-fit`-Grid). Aktuell ein großes Querformat-
  Platzhalterbild (foto1); weitere Shots brauchen später nur zusätzliche `<figure>`.
- Adaptiver Platzhalter (`currentColor`) funktioniert auf dem dunklen Grund.

### M6 — Fußball (Abseits der Werkstatt) ✅ (`Football.astro`)

- Akzent-Tonzone `tone-sport` (rot/gelb). Split: Text links / Bild rechts; mobil oben.
- Kicker „ASG Vorwärts Dessau", Heading, Text. **Dynamischer Hingucker**: foto3-Platzhalter
  leicht gekippt auf einer Gelb-Akzentkarte (statische Transforms → reduced-motion-neutral).

### M7 — Counter ✅ (`Counter.astro` + `scripts/counter.ts`)

- Scoreboard-Optik (große Zahl im Display-Font, Gelb, `tabular-nums`).
- Spaßzahl **1.337** (de-DE-Format), zählt beim Reinscrollen von 0 hoch
  (`IntersectionObserver` + `requestAnimationFrame`, easeOutCubic).
- `reduce` → sofort Endwert. No-JS-Fallback: Endwert steht im HTML.
- Untertext „…und es werden täglich mehr."

### M8 — Kontakt (Sag Hallo) ✅ (`Contact.astro`)

- Heading „Sag Hallo" + Lead-Text. Vier Kontakt-Buttons (E-Mail/Instagram/LinkedIn/WhatsApp)
  aus einem `contacts`-Array.
- **Kontaktwege sind noch offen** → Buttons sind **Platzhalter** (`data-placeholder`,
  noch kein `href`). Aktivierung später: je Eintrag `href` setzen → wird automatisch echter
  Link (externe bekommen `target="_blank" rel="noopener noreferrer"`). Inline dokumentiert.
- **Erweiterung (nach M8):** Buttons im jeweiligen **Plattform-Look** — self-hosted
  Inline-SVG-Icons + **Brand-on-Hover** (Outline-Pille mit Icon in Markenfarbe, füllt sich
  beim Hover in der Plattformfarbe; Instagram als Verlauf). Plattformfarben als Brand-Tokens.
  Der „bald"-Badge wurde zugunsten eines aktiven Looks entfernt (Buttons bleiben technisch
  inert, bis Links vorliegen). Ein Fix korrigierte den Instagram-Hover-Rand (kein
  transparenter Rand mehr → sauberer pinker Markenrand).

### M9 — Footer & Easter-Egg ✅ (`Footer.astro`)

- „Dank Dennis · {Jahr}" mit **dynamischem Jahr**.
- **Konfetti-Reprise**: kleiner Easter-Egg-Button „Noch ein Dank? 🎉" mit `data-confetti`,
  automatisch vom globalen Handler gebunden (kein neuer Import). `reduce` → kein Konfetti.

## 5. Qualität, Tests & Workflow

- **Verbindliche 5-Schritt-Schleife** je Meilenstein/Fix: Branch → Discovery → Tasks
  (TodoWrite) → Implementieren → Testen. Kein „Vibe-Coding".
- **`npm run check`** = `astro check` (Typecheck) + `prettier --check` + `astro build`.
- **`npm run test`** = Playwright e2e, läuft in **zwei Projekten**: `desktop-chromium`
  (Desktop Chrome) und `mobile-chromium` (Pixel 7) → mobil + Desktop.
- **`npm run verify`** = check + test (vor jedem Merge grün).
- Pro Sektion ein Spec in `tests/e2e/`: Inhalte/Anker vorhanden, Layout je Viewport,
  Interaktionen (Konfetti/Counter inkl. reduced-motion), **keine Konsolen-Fehler**,
  keine externen Font-Requests.
- **Aktueller Teststand: 62 Tests grün.**
- **Git-Rollenteilung:** Claude arbeitet lokal inkl. Merge nach `main` (`git merge --no-ff`,
  ein Merge-Commit pro Meilenstein); **Push/Pull macht ausschließlich der Mensch** (per Hook
  erzwungen). `main` ist für normale Code-Edits gesperrt (Ausnahme: reine Doku). Ein nativer
  `pre-push`-Hook fährt `npm run verify` als hartes Gate beim Push auf `main`.

## 6. Bewusste Entscheidungen / Konventionen

- **Bilder = Platzhalter bis M10**; echte Fotos gemeinsam auswählen, dann via `astro:assets`
  optimiert (WebP/srcset, `loading="lazy"` unten).
- **Plattform-Markenfarben** nur bei den Kontakt-Buttons; der Rest bleibt strikt in der
  Rot/Gelb/Holz-Welt.
- **Counter-Zahl** ist rein dekorativ (1.337).
- **Kontaktwege** noch offen → Platzhalter-Struktur, später nur Links eintragen.

## 7. Was noch offen ist (Roadmap)

- **M10 — Echte Fotos einbauen** (gemeinsam mit Nutzer; Skill `add-photo`): foto1–foto3
  optimiert über `astro:assets`, Alt-Texte, lazy-loading. Ersetzt die Platzhalter-Boxen.
- **M11 — Polish & QA**: A11y-Feinschliff, Meta/SEO/OpenGraph + OG-Image, Favicon,
  Lighthouse, Cross-Viewport-Durchlauf, vollständige Suite.
- **M12 — Deploy (Coolify)**: Static-Build `npm run build`, Publish-Dir `dist/`,
  Auto-Deploy bei Push auf `main`, Domain + SSL.

## 8. Offene inhaltliche Punkte

- **Kontaktwege** (E-Mail-Adresse, Social-Handles) — von Dennis zu klären, dann in
  `contacts` eintragen.
- **Foto-Auswahl** — gemeinsam in M10.
- **Exaktes Trikot-Rot** — final im Polish (aktuell `#c81e1e`).

---

_Visueller Gesamtstand: siehe `docs/dankdennis_full_page.png` (Full-Page-Screenshot,
Desktop)._
