# dankdennis.de

Persönliche One-Page-Visitenkarte für Dennis (gelernter Tischler im Ladenbau,
Feldspieler bei ASG Vorwärts Dessau). Zielgruppe: potenzielle Arbeitgeber UND neue
Bekanntschaften. **Kein Verkauf, kein Auftrags-Pitch.**

Markenkern: „Verlässlicher Teamplayer, der anpackt und Probleme löst."
Roter Faden: das Meme „Dank Dennis". Ton: verspielt-augenzwinkernd, aber glaubwürdig.

Konzept, Texte, Farben und Sektionen stehen in `docs/dankdennis_bauplan.md` und
`docs/dankdennis_brainstorming.md` — diese sind die **Quelle der Wahrheit für Inhalte**.

## Tech-Stack

- **Astro** (statischer Output, kein SSR), TypeScript für Skripte.
- Reines CSS mit Design-Tokens in `src/styles/tokens.css` (keine UI-Library). Im Code
  immer Tokens verwenden, nie Rohwerte (Hex/px/Font-Namen) hartkodieren.
- Client-Interaktionen client-seitig: `canvas-confetti` (Konfetti), IntersectionObserver
  (Counter). Kein Backend.
- Bilder über `astro:assets` (`<Image>`) — niemals un-optimierte `<img>` für Fotos.
- **Fonts immer self-hosted** (`@fontsource-variable`-Pakete: Bricolage Grotesque Variable
  für Display, Inter Variable für Fließtext) — NIE Google-Fonts-CDN oder andere externe
  Font-Requests (Datenschutz + Performance). Wird im Smoke-Test geprüft.
- **`prefers-reduced-motion: reduce` respektieren:** Konfetti löst dann NICHT aus (oder
  stark reduziert), der Counter zeigt sofort den Endwert statt zu animieren. Gilt für jede
  neue Animation. Zentrale Regeln in `src/styles/global.css`; in Playwright-Tests geprüft.

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
- **Claude arbeitet rein LOKAL:** Branch anlegen, committen, Tests fahren. **NIEMALS**
  `git push`, `git pull` oder `git fetch` — das macht ausschließlich der Mensch (per Hook
  erzwungen, auf jedem Branch).
- **`main` ist geschützt:** Edits/Writes und `git commit` auf `main` werden per Hook
  blockiert (Ausnahme: reine Doku — `docs/`, `CLAUDE.md`, `ROADMAP.md`, `README.md`).
  Merges nach `main` und alle Pushes macht der Mensch.
- Claude übergibt fertige, **grüne** Feature-Branches (`npm run verify` lokal grün). Der
  native `pre-push`-Hook erzwingt zusätzlich `npm run verify` beim manuellen Push auf `main`.

## Definition of Done (pro Meilenstein)

- Funktion entspricht `docs/`-Vorgabe; responsive (mobil + Desktop).
- `npm run check` grün (Astro-Check/Typecheck, Format, Build).
- Playwright-Tests der Sektion grün; keine Konsolen-Fehler.
- Echter Browser-Test bestätigt (Screenshot mobil + Desktop).

## Lokal starten & testen

```bash
npm install            # einmalig (aktiviert via prepare den nativen pre-push-Hook)
npm run dev            # Dev-Server (HMR) auf http://localhost:4321
npm run build          # statischer Build -> dist/
npm run preview        # dist/ lokal servieren
npm run check          # astro check + prettier --check + astro build  (Code-Tests)
npm run test           # Playwright e2e (Browser-Tests)
npm run test:headed    # Playwright sichtbar im Browser
npm run verify         # check + test in einem (vor Übergabe/Push)
```

`npm install` aktiviert über das `prepare`-Script automatisch die nativen git-Hooks
(`git config core.hooksPath .githooks`). Der `pre-push`-Hook blockt dann jeden roten Push
auf `main`. Falls nötig manuell: `git config core.hooksPath .githooks`.

Einmalig nötig für die Browser-Tests: `npx playwright install chromium` (lädt den Browser).

## Hooks — zwei Ebenen

- **Claude-Code-Hooks** (`.claude/settings.json` + `.claude/hooks/*.sh`): steuern, was
  Claude darf. `guard-no-main-edit.sh` (kein Code-Write/Commit auf `main`),
  `guard-no-push-pull.sh` (kein push/pull/fetch), PostToolUse-Prettier-Format,
  Commit-Reminder. Die `*.sh` brauchen das **Exec-Bit** (sonst feuern sie still nicht).
- **Nativer git-Hook** (`.githooks/pre-push`): hartes Test-Gate. Bei Push auf `refs/heads/main`
  läuft `npm run verify`; rot ⇒ Push abgebrochen. Feature-Branch-Pushes laufen ungebremst.

## Inhaltliche Leitplanken

- Deutsch, Du-Form, verspielt aber glaubwürdig. Fußball begeistert, aber dosiert —
  Handwerk & Charakter führen.
- Kontaktwege sind NOCH OFFEN → als Platzhalter-Buttons bauen, später nur Links eintragen.
- Fotos werden GEMEINSAM während der Implementierung ausgewählt (nicht vorab, gebündelt in
  M10). Bis dahin Platzhalterbilder. Vor Einbau optimieren (läuft über `astro:assets`).
- Counter-Zahl: Spaßzahl (z. B. 1.337), rein dekorativ.

## Deploy

- Self-hosted via **Coolify**: Auto-Deploy bei **Push auf `main` (macht der Mensch)**,
  Static-Build `npm run build`, Publish-Dir `dist/`. Domain + SSL via Coolify.
- Der Push auf `main` ist der einzige Weg in Produktion → der native `pre-push`-Hook
  (`npm run verify`) ist das harte Test-Gate. Details: Skill `deploy-check`.
