# ROADMAP — dankdennis.de

Jeder Meilenstein ist klein genug für **eine** saubere Runde der 5-Schritt-Schleife
(Branch → Discovery → Tasks → Implementieren → Testen; siehe `CLAUDE.md`). Reihenfolge =
Abhängigkeit (oben → unten), wo nicht anders vermerkt.

Status-Legende: ✅ erledigt · 🔜 als Nächstes · ⬜ offen

---

- **M0 — Fundament & Tooling** ✅ _(keine Abhängigkeit)_
  Astro-Projekt, Dependencies, `package.json`-Scripts (`dev`/`build`/`preview`/`check`/`test`/`verify`
  plus `prepare` für `core.hooksPath`), Prettier, `.gitignore`, Playwright-Setup + Smoke-Test,
  `Base.astro`, Design-Tokens inkl. Motion-Tokens (`tokens.css`/`global.css` mit
  `prefers-reduced-motion`-Regeln), **self-hosted Fonts** (variable `@fontsource`),
  **Claude-Code-Hooks** + **nativer `pre-push`-Hook**, die 4 Skills, CLAUDE.md + ROADMAP + README.
  **DoD:** `npm run dev` zeigt getokente Seite ohne externe Font-Requests; `npm run check`
  grün; Smoke-Test grün; Claude-Hooks aktiv (Edit/Commit auf `main` + push/pull/fetch
  blockiert); `pre-push`-Hook aktiv (`core.hooksPath=.githooks`, Hook-Skripte ausführbar).

- **M1 — Layout-Grundgerüst & Sektions-Platzhalter** 🔜 _(→ M0)_
  `index.astro`-Struktur: alle 7 Sektionen als leere Komponenten mit Headings + responsivem
  Container; Scroll-Fluss; warme/holzige vs. rot/gelbe Tonzonen als CSS-Grundlage.
  **DoD:** Alle Sektionen in korrekter Reihenfolge sichtbar, responsive Container steht,
  Test prüft Vorhandensein aller Section-Anker.

- **M2 — Hero** ⬜ _(→ M1)_
  Split-Layout (Text links, Platzhalterbild rechts; mobil Bild oben). Headline
  „Problem? Dank Dennis.", Untertitel, Button „Dank Dennis!" (ohne Konfetti-Logik noch).
  **DoD:** Hero responsive korrekt, Headline/Untertitel/Button im Test vorhanden.

- **M3 — Konfetti-Interaktion** ⬜ _(→ M2)_
  `canvas-confetti` einbinden, Click-Handler in `confetti.ts`, Hinweis „(probier's aus)".
  `prefers-reduced-motion: reduce` → kein/reduziertes Konfetti.
  **DoD:** Klick löst Konfetti aus (Playwright prüft Aufruf/Canvas), kein Konsolen-Fehler;
  Test mit `reduced-motion` bestätigt, dass kein Konfetti ausgelöst wird.

- **M4 — Über (Wer ist Dennis)** ⬜ _(→ M1)_
  Split mit Platzhalter-Porträt, Heading „Hi, ich bin Dennis." + 2 Absätze (Text aus docs).
  **DoD:** Inhalt + Layout responsive, Test grün.

- **M5 — Werkstatt** ⬜ _(→ M1)_
  Großes Platzhalterbild, Heading „In der Werkstatt", kurzer Text. (Galerie-fähig angelegt.)
  **DoD:** Sektion responsive, Test grün.

- **M6 — Fußball (Abseits der Werkstatt)** ⬜ _(→ M1)_
  Rot/gelb akzentuierte Sektion, dynamisches Platzhalterbild, Heading + Text aus docs.
  **DoD:** Akzent-Tonzone korrekt, responsive, Test grün.

- **M7 — Counter** ⬜ _(→ M1)_
  Scoreboard-Optik, große Zahl (z. B. 1.337), Count-Up via IntersectionObserver
  (`counter.ts`), Untertext „…und es werden täglich mehr."
  `prefers-reduced-motion: reduce` → sofort Endwert statt Hochzähl-Animation.
  **DoD:** Zahl zählt beim Reinscrollen von 0 hoch (Playwright prüft Animation/Endwert);
  Test mit `reduced-motion` bestätigt sofortigen Endwert.

- **M8 — Kontakt (Sag Hallo)** ⬜ _(→ M1)_
  Heading + Text, Platzhalter-Buttons (E-Mail/Instagram/LinkedIn/WhatsApp) so strukturiert,
  dass später nur Links/Adressen eingetragen werden müssen.
  **DoD:** Buttons vorhanden + als Platzhalter markiert; Struktur dokumentiert; Test grün.

- **M9 — Footer & Easter-Egg** ⬜ _(→ M3)_
  „Dank Dennis · {Jahr}", optional kleiner Konfetti-Button-Reprise.
  **DoD:** Jahr dynamisch, responsive, Test grün.

- **M10 — Echte Fotos einbauen** ⬜ _(→ M2/M4/M5/M6; gemeinsam mit Nutzer)_
  Fotos GEMEINSAM auswählen (Skill `add-photo`), per `astro:assets` optimiert einbinden,
  Alt-Texte, `loading="lazy"` für untere Bilder.
  **DoD:** Reale Bilder optimiert ausgeliefert (WebP/srcset), Layouts stimmen mobil+Desktop.

- **M11 — Polish & QA** ⬜ _(→ M2–M10)_
  A11y (Kontraste, Alt-Texte, Fokus), Meta/SEO/OpenGraph + OG-Image, Favicon, Lighthouse,
  Cross-Viewport-Durchlauf, vollständige Playwright-Suite.
  **DoD:** Lighthouse gut (Perf/A11y/SEO), volle Test-Suite grün, keine Konsolen-Fehler.

- **M12 — Deploy (Coolify)** ⬜ _(→ M11)_
  Coolify-App: Static-Build `npm run build`, Publish-Dir `dist/`, Auto-Deploy-Webhook bei
  Push auf `main`, Domain `dankdennis.de` + SSL. **Merge nach `main` macht Claude lokal
  (`--no-ff`); den Push macht der Mensch.** Der `pre-push`-Hook ist das Test-Gate. Skill
  `deploy-check` als Pre-Deploy-Checkliste.
  **DoD:** Manueller Push auf `main` deployt automatisch; Seite unter dankdennis.de mit SSL
  erreichbar; `pre-push`-Gate nachweislich aktiv (roter Push wird verhindert).

---

_Hinweis:_ M4–M8 hängen nur an M1 und sind grundsätzlich parallelisierbar; wir gehen sie
trotzdem nacheinander je 5-Schritt-Schleife durch. M10 bündelt die Foto-Auswahl, damit die
Sektionen vorher mit Platzhaltern stabil stehen.

## Offene Punkte (nicht blockierend)

- **Kontaktwege** (E-Mail/Social/WhatsApp): offen → in M8 als Platzhalter, später eintragen.
- **Foto-Auswahl**: gemeinsam in M10.
- **Counter-Zahl** & exaktes Trikot-Rot: in M7 bzw. Polish final festlegen.
- **Display-Font**: in M0 entschieden → **Bricolage Grotesque** (variabel).
