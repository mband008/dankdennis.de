---
name: milestone-workflow
description: Startet und führt die verbindliche 5-Schritt-Schleife für einen Meilenstein oder ein Fix auf dankdennis.de durch — Branch, Discovery, TodoWrite-Tasks, Implementierung, Tests. Nutzen, wenn ein neuer Meilenstein (M1, M2, …) oder eine Funktion/ein Fix begonnen wird.
---

# milestone-workflow

Operationalisiert die verbindliche Arbeitsweise aus `CLAUDE.md`. Kein Vibe-Coding:
erst verstehen & planen, dann umsetzen, dann testen. Pro Meilenstein/Fix genau **eine**
saubere Runde dieser Schleife.

## Wann verwenden

- Beginn eines Roadmap-Meilensteins (siehe `ROADMAP.md`).
- Jede neue Funktion oder jedes Fix, das Code ändert.

## Die 5 Schritte

1. **Branch erstellen** — nie auf `main` arbeiten.
   - Namensschema: `feat/<sektion>`, `fix/<kurz>`, `chore/<kurz>` (z. B. `feat/hero`).
   - `git checkout -b feat/<name>`
   - Erinnerung: Pushen/Mergen macht der Mensch. Claude bleibt lokal (per Hook erzwungen).

2. **Discovery & Analyse** — Ziel und Definition of Done klären.
   - Die Quelle der Wahrheit für Inhalte lesen: `docs/dankdennis_bauplan.md`,
     `docs/dankdennis_brainstorming.md`, sowie den relevanten Roadmap-Eintrag.
   - Bestehende Komponenten/Styles ansehen (`src/components/`, `src/styles/`).
   - DoD des Meilensteins notieren (was muss am Ende grün/sichtbar sein?).

3. **Tasks erstellen (TodoWrite)** — kleine, prüfbare Schritte ableiten.
   - Jeder Task ein abgrenzbares Stück (Markup, Styles, Interaktion, Test).

4. **Implementieren**
   - Tokens aus `src/styles/tokens.css` verwenden, keine Rohwerte hartkodieren.
   - Fotos über `astro:assets` (`<Image>`), nie rohe `<img>` für Fotos.
   - Neue Animation? `prefers-reduced-motion: reduce` respektieren (Pflicht).

5. **Testen** — Code-Tests UND echter Browser.
   - `npm run check` (astro check + prettier + build) muss grün sein.
   - Pro Sektion ein `tests/e2e/<sektion>.spec.ts`: Inhalte/Anker vorhanden, keine
     Konsolen-Fehler, mobil + Desktop. Für den interaktiven Browser-Test: Skill `browser-test`.
   - `npm run verify` lokal grün, bevor der Branch übergeben wird.

## Abschluss

- Kleine Conventional Commits (englisch): `feat(hero): add split layout`.
- DoD geprüft? Dann dem Menschen den fertigen, grünen Branch übergeben — er pusht/merged.
