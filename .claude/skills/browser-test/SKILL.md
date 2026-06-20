---
name: browser-test
description: Macht Schritt 5 (echter Browser) der 5-Schritt-Schleife konkret — startet den Preview-Server, prüft eine Sektion mit Playwright (MCP-Browser-Tools + tests/e2e) auf mobil + Desktop, macht Screenshots, prüft auf Konsolen-Fehler und schreibt/erweitert den passenden *.spec.ts. Nutzen, wenn eine Sektion im echten Browser verifiziert werden soll.
---

# browser-test

Der „echte Browser-Test" aus Schritt 5. Zwei sich ergänzende Wege: die automatisierte
Playwright-Suite (`tests/e2e/`) und der interaktive Durchlauf mit den Playwright-MCP-Tools.

## Vorbereitung

- Server starten: `npm run dev` (HMR, http://localhost:4321) für schnelles Iterieren,
  oder `npm run preview` für den echten statischen Build.
- Die automatisierte Suite startet ihren Server selbst (`webServer` in `playwright.config.ts`),
  daher braucht `npm run test` keinen laufenden Dev-Server.

## Interaktiver Durchlauf (MCP-Browser-Tools)

1. `browser_navigate` auf die Seite/den Anker der Sektion.
2. `browser_snapshot` für den Accessibility-Baum (Headings, Buttons vorhanden?).
3. Viewport prüfen: `browser_resize` auf Desktop (z. B. 1280×800) UND mobil (z. B. 390×844).
4. Interaktionen testen: `browser_click` (z. B. Konfetti-Button), Verhalten beobachten.
5. `browser_console_messages` — es dürfen KEINE Fehler auftreten.
6. `browser_take_screenshot` mobil + Desktop als Beleg.

## Automatisierter Spec

- Pro Sektion `tests/e2e/<sektion>.spec.ts` anlegen/erweitern. Mindestens:
  - Heading/Kerninhalte vorhanden (`getByRole('heading', …)`, `getByText(…)`).
  - Keine Konsolen-Fehler (`page.on('console', …)`).
  - Läuft in beiden Projekten (`desktop-chromium`, `mobile-chromium`).
- Für Animationen zusätzlich ein `reducedMotion: 'reduce'`-Fall (Konfetti löst nicht aus,
  Counter zeigt sofort Endwert).
- Fonts-Garantie nicht vergessen: keine externen Font-Requests (Muster siehe `smoke.spec.ts`).

## Lauf

- `npm run test` (headless) oder `npm run test:headed` (sichtbar).
- Grün + keine Konsolen-Fehler + Screenshots ok = Schritt 5 erfüllt.
