# dankdennis.de

Persönliche One-Page-Visitenkarte für **Dennis** — gelernter Tischler im Ladenbau und
Feldspieler bei ASG Vorwärts Dessau. Markenkern: _„Verlässlicher Teamplayer, der anpackt
und Probleme löst."_ Roter Faden: das Meme **„Dank Dennis"**. Kein Verkauf — eine
sympathische Visitenkarte für potenzielle Arbeitgeber und neue Bekanntschaften.

Gebaut mit **Astro** (statischer Output), self-hosted Fonts, reinem CSS mit Design-Tokens
und Playwright-E2E-Tests. Deployment self-hosted über **Coolify**.

## Schnellstart

```bash
npm install                  # Dependencies + aktiviert die nativen git-Hooks (prepare)
npx playwright install chromium   # einmalig: Browser für die E2E-Tests
npm run dev                  # http://localhost:4321
```

## Scripts

| Script                | Zweck                                              |
| --------------------- | -------------------------------------------------- |
| `npm run dev`         | Dev-Server mit HMR                                 |
| `npm run build`       | Statischer Build nach `dist/`                      |
| `npm run preview`     | `dist/` lokal servieren                            |
| `npm run check`       | `astro check` + `prettier --check` + `astro build` |
| `npm run test`        | Playwright-E2E (Desktop + Mobile)                  |
| `npm run test:headed` | Playwright sichtbar im Browser                     |
| `npm run verify`      | `check` + `test` — das Gate vor Übergabe/Push      |

## Projektstruktur (Kern)

```
src/
├── layouts/Base.astro     # <head>, Meta/OG, Fonts + globales CSS, <slot/>
├── pages/index.astro      # die One-Page
├── components/            # Sektions-Komponenten (ab M1)
├── styles/
│   ├── tokens.css         # Design-Tokens (Farben, Typo, Spacing, Motion)
│   ├── fonts.css          # self-hosted @fontsource-variable Imports
│   └── global.css         # Reset, Layout, prefers-reduced-motion-Regeln
├── scripts/               # confetti.ts, counter.ts (ab M3/M7)
└── assets/images/         # Quell-Fotos (von astro:assets optimiert)
tests/e2e/                 # Playwright-Specs (smoke.spec.ts u. a.)
docs/                      # Bauplan + Brainstorming = Quelle der Wahrheit für Inhalte
```

## Arbeitsweise & Git-Rollenteilung

Entwicklung folgt einer verbindlichen **5-Schritt-Schleife** (Branch → Discovery → Tasks →
Implementieren → Testen) — Details in [`CLAUDE.md`](./CLAUDE.md), Meilensteine in
[`ROADMAP.md`](./ROADMAP.md).

- Gearbeitet wird **nie direkt auf `main`** entwickelt, immer auf Feature-Branches.
- **Merges nach `main` macht Claude lokal** (`git merge --no-ff`, ein Merge-Commit pro
  Meilenstein). **`git push` / `git pull` / `git fetch` macht ausschließlich der Mensch.**
  Zwei Schutzebenen erzwingen das:
  - **Claude-Code-Hooks** (`.claude/`): blockieren normale Code-Writes/Commits auf `main`
    (Merge-Commits sind erlaubt) und push/pull/fetch generell.
  - **Nativer `pre-push`-Hook** (`.githooks/pre-push`): erzwingt `npm run verify` beim Push
    auf `main` — ein roter Build wird abgewiesen, damit Coolify nie Rotes deployt.

Die Hooks werden über `npm install` (`prepare` → `git config core.hooksPath .githooks`)
aktiviert. Manuell: `git config core.hooksPath .githooks`.

## Deploy

Self-hosted via **Coolify**: Static-Build `npm run build`, Publish-Dir `dist/`, Auto-Deploy
bei Push auf `main` (durch den Menschen), Domain `dankdennis.de` + SSL über Coolify.
Pre-Deploy-Checkliste: Skill `deploy-check`.
