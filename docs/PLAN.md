# Plan: Fundament für dankdennis.de (Astro, strukturiert, Coolify)

## Kontext

Greenfield-Projekt: persönliche One-Page-Visitenkarte **dankdennis.de** für Dennis
(gelernter Tischler im Ladenbau, leidenschaftlicher Fußballer/Feldspieler bei ASG
Vorwärts Dessau). Zielgruppe: potenzielle Arbeitgeber **und** neue Bekanntschaften —
**kein Verkauf**. Markenkern: _„Verlässlicher Teamplayer, der anpackt und Probleme löst."_
Roter Faden: das Meme **„Dank Dennis"**.

Aktueller Stand: Das Repo enthält nur `docs/dankdennis_bauplan.md` und
`docs/dankdennis_brainstorming.md` sowie ein leeres Git (keine Commits). Es gibt
keinen Code. Ziel dieses Schritts: ein **freigabefähiger Plan** für das Fundament —
Tech-Stack, Repo-Struktur, CLAUDE.md, Skills, Hooks, Roadmap, Test-Setup. Es wird in
diesem Schritt **noch nichts umgesetzt**; die Umsetzung des Fundaments (= Meilenstein M0)
erfolgt erst nach Freigabe.

**Getroffene Entscheidungen (vom Nutzer bestätigt):**

- Tech-Stack: **Astro** (statischer Output, automatische Bildoptimierung wegen vieler Fotos)
- Hosting: **Self-hosted via Coolify** — Auto-Deploy bei Push auf `main`, Static-Build
  `npm run build` → Output `dist/`, Domain + SSL übernimmt Coolify
- **Git-Rollenteilung:** `git push`/`git pull`/`git fetch` macht **ausschließlich der
  Mensch**. **Merges nach `main` macht Claude lokal** (`git merge --no-ff`, ein Merge-Commit
  pro Meilenstein). Claude arbeitet sonst lokal: Branch anlegen, committen, Tests fahren,
  fertige grüne Meilensteine nach `main` mergen — und meldet „`main` ist push-bereit".
  Erzwungen per Hook.
- **Hooks (Claude Code):** normale Edit/Write + normaler `git commit` auf `main` blockiert
  (`git merge` und Merge-Commit erlaubt); `git push`/`git pull`/`git fetch` auf **jedem**
  Branch blockiert (nur der Mensch); PostToolUse Auto-Format; Tests-vor-Commit als Reminder.
- **Test-Gate vor Produktion:** nativer git **`pre-push`-Hook**, der bei Push auf `main`
  `npm run verify` erzwingt und rote Pushes blockt (schützt den manuellen Push des Menschen).
- **Fonts self-hosted** (kein Google-Fonts-CDN) — Datenschutz + Performance.
- **`prefers-reduced-motion`** wird respektiert (Konfetti + Counter), als feste Regel + Test.

---

## 1. Tech-Stack (mit Begründung)

**Astro** (statischer Output, kein SSR).

- **Bildoptimierung automatisch:** `astro:assets` / `<Image>` erzeugt responsive `srcset`,
  moderne Formate (WebP/AVIF) und `loading="lazy"`. Bei „vielen Fotos" der entscheidende
  Vorteil ggü. purem HTML (dort wäre jedes Bild manuelles Squoosh/TinyPNG).
- **Sektions-Komponenten:** Jede Sektion (Hero, Über, Werkstatt, Fußball, Counter,
  Kontakt, Footer) wird eine eigene `.astro`-Datei → kleine, testbare, klar abgegrenzte
  Einheiten, ideal für die 5-Schritt-Schleife pro Meilenstein.
- **Dev-Server + Test-Anschluss:** `astro dev` (HMR) und `astro preview` lassen sich sauber
  als `webServer` in Playwright einhängen.
- **Output bleibt 100% statisch** (`dist/`) → passt exakt zu Coolify-Static-Deploy, null
  laufende Kosten, wartungsarm.
- Client-Interaktionen (Konfetti, Counter) laufen als kleine `<script>`-Inseln —
  kein Framework-Overhead, kein Backend.

_Begründung gegen pures HTML/CSS/JS:_ funktioniert auch, aber manuelle Bildoptimierung
und fehlende Komponenten/Tooling widersprechen dem Wunsch nach strikt strukturierter,
testbarer Arbeit. Astro liefert Struktur + Optimierung bei minimalem Build-Overhead.

---

## 2. Repo-Struktur

```
dankdennis.de/
├── .claude/
│   ├── settings.json            # Claude-Code-Hooks (versioniert, im Team gültig)
│   ├── settings.local.json      # lokale Overrides (gitignored)
│   ├── hooks/                   # Guard-Skripte für Claude-Code-Hooks
│   │   ├── guard-no-main-edit.sh
│   │   └── guard-no-push-pull.sh
│   └── skills/
│       ├── milestone-workflow/SKILL.md
│       ├── browser-test/SKILL.md
│       ├── add-photo/SKILL.md
│       └── deploy-check/SKILL.md
├── .githooks/                   # NATIVE git-Hooks (via core.hooksPath aktiviert)
│   └── pre-push                 # erzwingt `npm run verify` bei Push auf main
├── docs/
│   ├── dankdennis_bauplan.md            # vorhanden
│   └── dankdennis_brainstorming.md      # vorhanden
├── public/                      # statische Passthrough-Assets (favicon, robots.txt, og-image)
├── src/
│   ├── pages/index.astro        # die One-Page, setzt die Sektionen zusammen
│   ├── layouts/Base.astro       # <head>, Meta/OG, Fonts, globales CSS, <slot/>
│   ├── components/
│   │   ├── Hero.astro
│   │   ├── About.astro
│   │   ├── Workshop.astro
│   │   ├── Football.astro
│   │   ├── Counter.astro
│   │   ├── Contact.astro
│   │   └── Footer.astro
│   ├── styles/
│   │   ├── tokens.css           # Design-Tokens: Farben, Typo, Spacing, Motion (CSS custom props)
│   │   ├── fonts.css            # @font-face für self-hosted Fonts (oder @fontsource-Imports)
│   │   └── global.css           # Reset, Basis-Layout, Utility-Klassen, reduced-motion-Regeln
│   ├── scripts/
│   │   ├── confetti.ts          # Konfetti-Button-Logik (canvas-confetti)
│   │   └── counter.ts           # IntersectionObserver Count-Up
│   └── assets/images/           # Quell-Fotos (von astro:assets optimiert)
├── tests/e2e/
│   ├── smoke.spec.ts
│   ├── hero.spec.ts
│   ├── counter.spec.ts
│   └── ... (pro Sektion)
├── astro.config.mjs
├── playwright.config.ts
├── tsconfig.json
├── package.json
├── .prettierrc / prettier.config.mjs
├── .gitignore                   # node_modules, dist, .astro, test-results, settings.local.json
├── CLAUDE.md
├── ROADMAP.md
└── README.md
```

Farbwelt (aus `docs/`) landet als Tokens in `src/styles/tokens.css`:
`--color-red:#C81E1E`, `--color-yellow:#F2B705`, `--bg:#F7F3EC`, `--bg-dark:#2A211B`,
`--text:#1C1916`.

**Fonts self-hosted** (kein Google-Fonts-CDN): Display (Anton/Bricolage Grotesque) + Inter
werden über **`@fontsource`-Pakete** (npm, self-hosted, in `Base.astro`/`fonts.css`
importiert) oder lokale `.woff2`-Dateien in `src/assets/fonts/` mit `@font-face` eingebunden.
Keine Requests an fonts.googleapis.com/fonts.gstatic.com.

---

## 3. Entwurf CLAUDE.md (~110 Zeilen)

> Wird bei Freigabe als `CLAUDE.md` im Root angelegt. Entwurf:

````markdown
# dankdennis.de

Persönliche One-Page-Visitenkarte für Dennis (gelernter Tischler im Ladenbau,
Feldspieler bei ASG Vorwärts Dessau). Zielgruppe: potenzielle Arbeitgeber UND neue
Bekanntschaften. **Kein Verkauf, kein Auftrags-Pitch.**

Markenkern: „Verlässlicher Teamplayer, der anpackt und Probleme löst."
Roter Faden: das Meme „Dank Dennis". Ton: verspielt-augenzwinkernd, aber glaubwürdig.

Konzept, Texte, Farben und Sektionen stehen in `docs/dankdennis_bauplan.md` und
`docs/dankdennis_brainstorming.md` — diese sind die Quelle der Wahrheit für Inhalte.

## Tech-Stack

- **Astro** (statischer Output, kein SSR), TypeScript für Skripte.
- Reines CSS mit Design-Tokens in `src/styles/tokens.css` (keine UI-Library).
- Client-Interaktionen client-seitig: `canvas-confetti` (Konfetti), IntersectionObserver
  (Counter). Kein Backend.
- Bilder über `astro:assets` (`<Image>`) — niemals un-optimierte `<img>` für Fotos.
- **Fonts immer self-hosted** (`@fontsource`-Pakete oder lokale `.woff2`) — NIE Google-Fonts-
  CDN oder andere externe Font-Requests (Datenschutz + Performance).
- **`prefers-reduced-motion: reduce` respektieren:** Konfetti löst dann NICHT aus (oder stark
  reduziert), der Counter zeigt sofort den Endwert statt zu animieren. Gilt für jede neue
  Animation. Wird in den Playwright-Tests geprüft.

## Verbindliche Arbeitsweise — gilt für JEDEN Meilenstein UND jede Funktion/jedes Fix

1. **Branch erstellen** (nie direkt auf `main` arbeiten)
2. **Discovery & Analyse** (docs/ + bestehenden Code lesen, Ziel + DoD klären)
3. **Tasks erstellen** (TodoWrite: kleine, prüfbare Schritte)
4. **Implementieren**
5. **Testen** — Code-Tests (`npm run check`) UND echter Browser-Test (Playwright)

Kein „Vibe-Coding": erst verstehen & planen, dann umsetzen, dann testen. Nutze den Skill
`milestone-workflow`, um die Schleife zu starten, und `browser-test` für Schritt 5 (Browser).

## Branch- & Commit-Konventionen + Git-Rollenteilung

- Branch-Namen: `feat/<sektion>`, `fix/<kurz>`, `chore/<kurz>` (z. B. `feat/hero`).
- Ein Branch = ein Meilenstein/eine Funktion.
- Commits: **Conventional Commits** (englisch), z. B. `feat(hero): add split layout`,
  `fix(counter): trigger on scroll`. Kleine, fokussierte Commits.
- **Claude arbeitet lokal — inkl. Merge nach `main`:** Branch anlegen, committen, Tests
  fahren UND fertige Meilensteine lokal nach `main` mergen. **NIEMALS** `git push`,
  `git pull` oder `git fetch` — das macht ausschließlich der Mensch (per Hook erzwungen).
- **`main` ist geschützt:** normale Edits/Writes und normale `git commit` auf `main` werden
  per Hook blockiert (Ausnahme: reine Doku). **Erlaubt** ist das Mergen nach `main`
  (`git merge` und Merge-Commit). Push/Pull bleiben dem Menschen vorbehalten.
- **Meilenstein-Merge:** Claude merged den grünen Feature-Branch lokal mit
  `git merge --no-ff` nach `main` (ein Merge-Commit pro Meilenstein) und meldet dann
  „`main` ist push-bereit". Den Push macht der Mensch.
- Vor dem Merge ist `npm run verify` lokal grün. Der native `pre-push`-Hook erzwingt
  `npm run verify` zusätzlich beim manuellen Push des Menschen auf `main`.

## Definition of Done (pro Meilenstein)

- Funktion entspricht `docs/`-Vorgabe; responsive (mobil + Desktop).
- `npm run check` grün (Astro-Check/Typecheck, Format, Build).
- Playwright-Tests der Sektion grün; keine Konsolen-Fehler.
- Echter Browser-Test bestätigt (Screenshot mobil + Desktop).

## Lokal starten & testen

```bash
npm install            # einmalig
npm run dev            # Dev-Server (HMR) auf http://localhost:4321
npm run build          # statischer Build -> dist/
npm run preview        # dist/ lokal servieren
npm run check          # Astro-Check + Prettier-Check + Build  (Code-Tests)
npm run test           # Playwright e2e (Browser-Tests)
npm run test:headed    # Playwright sichtbar im Browser
npm run verify         # check + test in einem (vor Commit/Push)
```
````

`npm install` aktiviert über das `prepare`-Script automatisch die nativen git-Hooks
(`git config core.hooksPath .githooks`). Der `pre-push`-Hook blockt dann jeden roten Push
auf `main`. Falls nötig manuell: `git config core.hooksPath .githooks`.

## Inhaltliche Leitplanken

- Deutsch, Du-Form, verspielt aber glaubwürdig. Fußball begeistert, aber dosiert —
  Handwerk & Charakter führen.
- Kontaktwege sind NOCH OFFEN → als Platzhalter-Buttons bauen, später nur Links eintragen.
- Fotos werden GEMEINSAM während der Implementierung ausgewählt (nicht vorab). Bis dahin
  Platzhalterbilder. Vor Einbau optimieren (läuft über `astro:assets`).
- Counter-Zahl: Spaßzahl (z. B. 1.337), rein dekorativ.

## Deploy

- Self-hosted via **Coolify**: Auto-Deploy bei **Push auf `main` (macht der Mensch)**,
  Static-Build `npm run build`, Publish-Dir `dist/`. Domain + SSL via Coolify.
- Der Push auf `main` ist der einzige Weg in Produktion → der native `pre-push`-Hook
  (`npm run verify`) ist das harte Test-Gate. Details: Skill `deploy-check`.

```

---

## 4. Skills unter `.claude/skills/`

| Skill | Zweck |
|---|---|
| **milestone-workflow** | Operationalisiert die 5-Schritt-Schleife: legt Branch an, führt durch Discovery → TodoWrite-Tasks → Implementierung → Tests, prüft die Definition of Done und bereitet Commit/PR vor. Startpunkt für jeden Meilenstein/Fix. |
| **browser-test** | Macht Schritt 5 (Browser) konkret: startet den Preview-Server, fährt mit Playwright (MCP-Browser-Tools + `tests/e2e`) die Sektion ab, prüft mobil + Desktop-Viewport, macht Screenshots, prüft auf Konsolen-Fehler. Schreibt/erweitert den passenden `*.spec.ts`. |
| **add-photo** | Foto gemeinsam auswählen & einbinden: Quellbild nach `src/assets/images/` legen, per `<Image>` einbauen (Alt-Text, sinnvolle `sizes`), Layout im Browser prüfen. Stellt sicher, dass Bilder optimiert (nicht roh) ausgeliefert werden. |
| **deploy-check** | Pre-Deploy-Checkliste für Coolify: `npm run verify` grün, Build erzeugt `dist/`, Meta/OG/Favicon vorhanden, Build-Command + Publish-Dir korrekt. Dokumentiert die Coolify-Einstellungen (Static-Build, Auto-Deploy-Webhook). |

*Optional/später denkbar (nicht im Fundament):* `new-section` (Komponenten-Scaffold mit
Tokens + Test-Stub), `content-edit` (Copy-Änderungen mit Ton-Leitplanken). Erst anlegen,
wenn echter Bedarf — keine Skill-Sammlung auf Vorrat.

---

## 5. Hooks — zwei Ebenen

### A) Claude-Code-Hooks (in `.claude/settings.json`, Guard-Skripte in `.claude/hooks/`)
Steuern, was **Claude** im Editor/Terminal darf:

- **PreToolUse → Edit/Write/MultiEdit** (`guard-no-main-edit.sh`): prüft
  `git rev-parse --abbrev-ref HEAD`. Ist der Branch `main`/`master` → Schreibzugriff
  **blockiert** mit Hinweis „Erst Branch erstellen (Schritt 1)".
  *Ausnahme:* `docs/`, `CLAUDE.md`, `ROADMAP.md`, `README.md` bleiben erlaubt (reine Doku).
- **PreToolUse → Bash, `git commit` auf `main`** (`guard-no-main-edit.sh`): **blockiert**.
- **PreToolUse → Bash, `git push` / `git pull` / `git fetch`** (`guard-no-push-pull.sh`):
  **auf JEDEM Branch blockiert** mit Hinweis „Push/Pull/Fetch macht nur der Mensch".
  Claude bleibt rein lokal (Branch + Commit + Tests).
- **PostToolUse → Edit/Write auf `*.astro|*.css|*.ts|*.js`:** Prettier auto-format der
  geänderten Datei.
- **Tests-vor-Commit (Reminder):** PreToolUse-Hinweis bei `git commit`
  („`npm run verify` gelaufen?") — weicher Reminder, kein Block (das harte Gate sitzt am Push).

### B) Nativer git-Hook (`.githooks/pre-push`, via `core.hooksPath` aktiviert)
Das **harte Test-Gate vor Produktion** — greift beim manuellen Push des Menschen:

- `pre-push` liest die zu pushenden Refs (stdin). **Nur wenn `refs/heads/main` aktualisiert
  wird**, läuft `npm run verify`; schlägt es fehl → **Push abgebrochen** (Exit ≠ 0).
- Feature-Branch-Pushes werden **nicht** ausgebremst (kein verify-Lauf).
- Damit ist „`main` ist immer grün → Coolify deployt nie Rotes" hart erzwungen, ohne CI.
- **Aktivierung lokal:** automatisch über `package.json`-Script `prepare`
  (`git config core.hooksPath .githooks`) bei `npm install`; manuell:
  `git config core.hooksPath .githooks`. Dokumentiert in CLAUDE.md + README.

*Zusammenspiel:* Claude darf nie pushen (Hook A) → der einzige Push auf `main` kommt vom
Menschen und muss durch das verify-Gate (Hook B). Konkrete `settings.json`- und
Hook-Skript-Inhalte entstehen in M0.

---

## 6. ROADMAP.md (Meilensteine + Abhängigkeiten)

> Wird bei Freigabe als `ROADMAP.md` angelegt. Jeder Meilenstein ist klein genug für **eine**
> saubere Runde der 5-Schritt-Schleife. Reihenfolge = Abhängigkeit (oben → unten), wo nicht
> anders vermerkt.

- **M0 — Fundament & Tooling** *(keine Abhängigkeit)*
  Astro-Projekt initialisieren, Dependencies, `package.json`-Scripts (`dev/build/preview/
  check/test/verify` + `prepare` für `core.hooksPath`), Prettier, `.gitignore`,
  Playwright-Setup + 1 Smoke-Test, `Base.astro`, Design-Tokens inkl. Motion-Tokens
  (`tokens.css`/`global.css` mit `prefers-reduced-motion`-Regeln), **self-hosted Fonts**
  (`@fontsource`/lokale `.woff2`, `fonts.css`), **Claude-Code-Hooks** (`.claude/settings.json`
  + `.claude/hooks/guard-no-main-edit.sh` + `guard-no-push-pull.sh`), **nativer git
  `pre-push`-Hook** (`.githooks/pre-push` + `core.hooksPath`-Aktivierung), Skills anlegen,
  CLAUDE.md + ROADMAP + README.
  **DoD:** `npm run dev` zeigt leere, getokente Seite (Fonts self-hosted, keine externen
  Font-Requests); `npm run check` grün; Smoke-Test (Seite lädt, Titel stimmt) grün;
  Claude-Hooks aktiv (Edit auf `main` blockiert, `git push/pull/fetch` blockiert);
  `pre-push`-Hook aktiv (`core.hooksPath=.githooks`, blockt roten Push auf `main`).

- **M1 — Layout-Grundgerüst & Sektions-Platzhalter** *(→ M0)*
  `index.html`-Struktur via `index.astro`: alle 7 Sektionen als leere Komponenten mit
  Headings + responsivem Container; Scroll-Fluss; warme/holzige vs. rot/gelbe Tonzonen
  als CSS-Grundlage.
  **DoD:** Alle Sektionen in korrekter Reihenfolge sichtbar, responsive Container steht,
  Test prüft Vorhandensein aller Section-Anker.

- **M2 — Hero** *(→ M1)*
  Split-Layout (Text links, Platzhalterbild rechts; mobil Bild oben). Headline
  „Problem? Dank Dennis.", Untertitel, Button „Dank Dennis!" (ohne Konfetti-Logik noch).
  **DoD:** Hero responsive korrekt, Headline/Untertitel/Button im Test vorhanden.

- **M3 — Konfetti-Interaktion** *(→ M2)*
  `canvas-confetti` einbinden, Click-Handler in `confetti.ts`, Hinweis „(probier's aus)".
  `prefers-reduced-motion: reduce` → kein/reduziertes Konfetti.
  **DoD:** Klick löst Konfetti aus (Playwright prüft Aufruf/Canvas), kein Konsolen-Fehler;
  Test mit `reduced-motion` bestätigt, dass kein Konfetti ausgelöst wird.

- **M4 — Über (Wer ist Dennis)** *(→ M1)*
  Split mit Platzhalter-Porträt, Heading „Hi, ich bin Dennis." + 2 Absätze (Text aus docs).
  **DoD:** Inhalt + Layout responsive, Test grün.

- **M5 — Werkstatt** *(→ M1)*
  Großes Platzhalterbild, Heading „In der Werkstatt", kurzer Text. (Galerie-fähig angelegt.)
  **DoD:** Sektion responsive, Test grün.

- **M6 — Fußball (Abseits der Werkstatt)** *(→ M1)*
  Rot/gelb akzentuierte Sektion, dynamisches Platzhalterbild, Heading + Text aus docs.
  **DoD:** Akzent-Tonzone korrekt, responsive, Test grün.

- **M7 — Counter** *(→ M1)*
  Scoreboard-Optik, große Zahl (z. B. 1.337), Count-Up via IntersectionObserver
  (`counter.ts`), Untertext „…und es werden täglich mehr."
  `prefers-reduced-motion: reduce` → sofort Endwert statt Hochzähl-Animation.
  **DoD:** Zahl zählt beim Reinscrollen von 0 hoch (Playwright prüft Animation/Endwert);
  Test mit `reduced-motion` bestätigt sofortigen Endwert.

- **M8 — Kontakt (Sag Hallo)** *(→ M1)*
  Heading + Text, Platzhalter-Buttons (E-Mail/Instagram/LinkedIn/WhatsApp) so strukturiert,
  dass später nur Links/Adressen eingetragen werden müssen.
  **DoD:** Buttons vorhanden + als Platzhalter markiert; Struktur dokumentiert; Test grün.

- **M9 — Footer & Easter-Egg** *(→ M3)*
  „Dank Dennis · {Jahr}", optional kleiner Konfetti-Button-Reprise.
  **DoD:** Jahr dynamisch, responsive, Test grün.

- **M10 — Echte Fotos einbauen** *(→ M2/M4/M5/M6; gemeinsam mit Nutzer)*
  Fotos GEMEINSAM auswählen (Skill `add-photo`), per `astro:assets` optimiert einbinden,
  Alt-Texte, `loading="lazy"` für untere Bilder.
  **DoD:** Reale Bilder optimiert ausgeliefert (WebP/srcset), Layouts stimmen mobil+Desktop.

- **M11 — Polish & QA** *(→ M2–M10)*
  A11y (Kontraste, Alt-Texte, Fokus), Meta/SEO/OpenGraph + OG-Image, Favicon, Lighthouse,
  Cross-Viewport-Durchlauf, vollständige Playwright-Suite.
  **DoD:** Lighthouse gut (Perf/A11y/SEO), volle Test-Suite grün, keine Konsolen-Fehler.

- **M12 — Deploy (Coolify)** *(→ M11)*
  Coolify-App: Static-Build `npm run build`, Publish-Dir `dist/`, Auto-Deploy-Webhook bei
  Push auf `main`, Domain `dankdennis.de` + SSL. **Merge nach `main` macht Claude lokal
  (`--no-ff`); den Push macht der Mensch.** Der `pre-push`-Hook ist das Test-Gate. Skill
  `deploy-check` als zusätzliche Pre-Deploy-Checkliste.
  **DoD:** Manueller Push auf `main` deployt automatisch; Seite unter dankdennis.de mit SSL
  erreichbar; `pre-push`-Gate nachweislich aktiv (roter Push wird verhindert).

*Hinweis:* M4–M8 hängen nur an M1 und sind grundsätzlich parallelisierbar; wir gehen sie
trotzdem nacheinander je 5-Schritt-Schleife durch. M10 bündelt die Foto-Auswahl, damit die
Sektionen vorher mit Platzhaltern stabil stehen.

---

## 7. Tests konkret (Code + Browser)

**Code-Tests** (`npm run check`):
- `astro check` — Typecheck (.astro + TS), Template-Fehler, kaputte Imports.
- `prettier --check .` — Formatierung.
- `astro build` — Build muss fehlerfrei `dist/` erzeugen (fängt Asset-/Import-Fehler).
- *(optional später)* `vitest` für reine JS-Logik (z. B. Counter-Hochzähl-Funktion isoliert).

**Browser-Tests** (`npm run test`, Playwright):
- `playwright.config.ts` mit `webServer` (startet `astro preview` auf festem Port, baut bei
  Bedarf vorher) und Projekten für **Desktop-Chromium** + **Mobile (z. B. Pixel 7)**.
- Pro Sektion ein `*.spec.ts`: Headings/Inhalte vorhanden, Layout-Anker da, **keine
  Konsolen-Fehler**, Screenshots mobil + Desktop.
- Interaktions-Specs: Konfetti-Button (Aufruf/Canvas), Counter (zählt von 0 auf Zielwert
  bei Sichtbarkeit), Kontakt-Platzhalter vorhanden.
- **`prefers-reduced-motion`-Specs:** Playwright-Projekt/Kontext mit
  `reducedMotion: 'reduce'` → Konfetti löst NICHT aus, Counter zeigt sofort den Endwert.
- **Self-hosted-Fonts-Check:** Test prüft via Netzwerk-Mitschnitt, dass **keine** Requests
  an `fonts.googleapis.com`/`fonts.gstatic.com` (oder andere externe Font-Hosts) gehen.
- Zusätzlich interaktiv über Skill **browser-test** mit den Playwright-MCP-Tools für den
  „echten Browser-Test" während der Implementierung (Snapshot, Klicken, Screenshot).

**Tooling/Scripts in `package.json`:**
```

dev astro dev
build astro build
preview astro preview
check astro check && prettier --check . && astro build
test playwright test
test:headed playwright test --headed
verify npm run check && npm run test
prepare git config core.hooksPath .githooks # aktiviert den nativen pre-push-Hook

```
`verify` ist das Gate vor Commit/Push: der `pre-push`-Hook ruft es bei Push auf `main` auf,
der Claude-Code-Reminder verweist beim Commit darauf.

---

## Verifikation dieses Schritts

Dieser Schritt ist **reiner Plan** — keine Umsetzung. „Verifikation" = deine Freigabe.
Nach Freigabe ist der erste umzusetzende Schritt **Meilenstein M0 (Fundament & Tooling)**,
der dann selbst die 5-Schritt-Schleife durchläuft (Branch → Discovery → Tasks →
Implementieren → Testen) und mit seiner Definition of Done abgeschlossen wird: Dev-Server
läuft, `npm run check` grün, Smoke-Test grün, Claude-Hooks aktiv (Edit auf `main` +
`git push/pull/fetch` blockiert), nativer `pre-push`-Hook aktiv (blockt roten Push auf `main`),
Fonts self-hosted.

## Offene Punkte (vor/während Umsetzung, nicht blockierend)
- **Kontaktwege** (E-Mail/Social/WhatsApp): noch offen → in M8 als Platzhalter, später eintragen.
- **Foto-Auswahl**: gemeinsam in M10.
- **Counter-Zahl** & exaktes Trikot-Rot: in M7 bzw. Polish final festlegen.
- **Display-Font** (Anton vs. Bricolage Grotesque): in M0/M1 zusammen entscheiden.
```
