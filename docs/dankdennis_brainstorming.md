# dankdennis.de — Ideen & Brainstorming

_Lebendes Dokument – wir füllen und schärfen es gemeinsam im Gespräch._

## Die Story

- Domain **dankdennis.de**, Dennis geschenkt bekommen.
- Ursprung als Meme: Immer wenn ein Problem gelöst wurde → **"Dank Dennis"**.
- Aktueller Stand: noch keine Nutzung, alles offen.

## Über Dennis (Fakten)

- **Gelernter Tischler/Schreiner** – baut & repariert buchstäblich Dinge aus Holz.
- **Angestellt** in einem großen **Ladenbau-Betrieb** – Teil eines **Schreiner-Teams**, das Ladeneinrichtungen baut (nicht selbstständig → keine Kundengewinnung).
- **Fußball ist sein Leben** – **Feldspieler** bei **ASG Vorwärts Dessau** (Vereinsfarben **Rot-Gelb**, Trikot rot).
- **Fotomaterial vorhanden:**
  - Werkstatt: Dennis konzentriert beim Bauen (Schwalbenschwanz-Verbindung) + sympathisches, lachendes Porträt in der Werkstatt.
  - Fußball: Feldspieler-Action (+ ein paar Torwart-Shots, aber Position = Feld).

## Leitstern

Das Meme hat eine eingebaute Bedeutung: **Dennis = der, der Probleme löst und dem man dankt.**
→ Die stärksten Ideen spielen mit **"Probleme lösen"** und/oder **"Danke sagen"**.

**Glücksfall:** Weil Dennis **Tischler** ist, ist "Problem? Dank Dennis." fast schon ein **fertiger Markenspruch** – der Beruf macht aus dem Insider-Witz einen ehrlichen Slogan.

## Zweck & Zielgruppe _(festgelegt)_

- **Zweck:** **persönliche Visitenkarte** – _keine_ Auftragsakquise.
- **Zielgruppe:**
  1. **Potenzieller Arbeitgeber** – soll sehen: solider, verlässlicher Tischler und guter Typ.
  2. **Neue Bekanntschaft** (privat) – soll einen sympathischen, echten Eindruck von Dennis bekommen.
- **Konsequenz:** Kein Verkaufs-CTA ("Angebot anfragen"). Stattdessen **"kennenlernen / Hallo sagen / vernetzen"**.

## Markenkern

**"Verlässlicher Teamplayer, der anpackt und Probleme löst."**
Verbindet alles: **Handwerk** (anpacken & lösen) + **Fußball** (Teamplayer) + **Meme** (Dank Dennis).

**Fußball-Verbindung:** Dennis ist **Feldspieler** – einer, der anpackt, nach vorne geht und sich aufs Team verlässt. Genau die Haltung, die er auch in die Werkstatt mitnimmt: zuverlässig, mannschaftsdienlich, da, wenn's drauf ankommt. _(Die anfängliche Torwart-Idee fällt damit weg – passt nicht zu seiner Position.)_

## Entscheidung: Fußball – ja, aber dosiert

Die Sorge ("nur ein Hobby") ist für _diese_ Art Seite eigentlich unbegründet:

- Die Seite beantwortet "**Wer ist Dennis?**" – für Arbeitgeber wie für neue Bekanntschaften. Das sind Menschen-Eindrücke, kein Verkauf. Genau dafür ist eine echte Leidenschaft Gold: macht sympathisch, zeigt Engagement, Disziplin, Teamgeist.
- **Einziger Stolperstein:** beim Arbeitgeber-Blick soll Fußball die Fachlichkeit nicht _überstrahlen_.
- **Lösung:** Handwerk & Charakter führen, Fußball als klar abgegrenzter, begeisterter Block ("Abseits der Werkstatt") + dezenter Design-Touch in **Vereinsrot/-gelb** (ASG Vorwärts Dessau). Begeistert, aber nicht das ganze Haus.

## Konzept: One-Pager als persönliche Visitenkarte

Eine einzelne, gut gemachte Scroll-Seite. Das Meme ist der Charme, der Markenkern der rote Faden.

**Grober Aufbau (mit Foto-Zuordnung):**

1. **Hero** — "Problem? Dank Dennis." groß, + verspielter Button (Konfetti). Bild: **Werkstatt-Action (Foto 1)**. Untertitel verbindet beide Seiten, z. B. _"Tischler. Fußballer. Der Typ, der anpackt."_
2. **Wer ist Dennis** — sympathisches **Werkstatt-Porträt (Foto 2)**; kurz: Schreiner im Ladenbau (Team, das Ladeneinrichtungen baut) + Charakter + Meme-Story.
3. **Dennis bei der Arbeit** — Werkstatt-Action, atmosphärisch (Holz, Werkstattlicht). Zeigt Handwerk _und_ Mensch.
4. **Abseits der Werkstatt: auf dem Platz** — Fußball-Block in Vereinsrot/-gelb; **Feldspieler-Action (Foto 3)** als dynamischer Hingucker. Thema: Teamgeist & Verlässlichkeit.
5. **Dennis-Counter** — "Probleme gelöst: X" verspielt (Scoreboard-Optik, passt zum Sport).
6. **Hallo sagen / Vernetzen** — Kontaktwege (vorerst Platzhalter). Kein Verkauf, eher "meld dich".
7. Optional: kleines Easter Egg (z. B. der Button vergibt einen "Dank").

## Tech & Umsetzung

- **Stack:** statische Seite – pures HTML/CSS/JS (am wartungsärmsten) oder leichtes Astro/Vite.
- **Hosting:** Cloudflare Pages / Netlify / Vercel / GitHub Pages – kostenlos, Auto-Deploy aus Git, ~null Wartung.
- **Domain:** dankdennis.de auf den Hoster zeigen lassen.
- **Interaktionen** (Button, Konfetti, Counter): client-seitig → kein Server, keine laufenden Kosten.
- **Design-Richtung:** foto-geführt & atmosphärisch. **Farbwelt: Rot (Trikot/ASG) + Gelb-Akzent + warme Holztöne** aus den Werkstatt-Fotos (Off-White/Anthrazit für Text). Rot verbindet beide Welten, Holz erdet, Gelb setzt Akzente. Fotos sind im **Hochformat** → Split-Layouts (Bild neben Text) anbieten sich.

## Ideen-Sammlung (Menü)

_(zur Orientierung – Kern ist oben das Konzept)_

- **Meme-treu:** Hero-Button mit Konfetti (drin) · Dennis-Counter (drin) · Meme-Generator (optionale Bonus-Seite, client-seitig) · Wall of Dank _(geparkt: Backend/Moderation)_
- **Visitenkarte:** persönliche Visitenkarte (Kern) · Action-Fotos "Dennis bei der Arbeit" (drin) · Fußball/Teamgeist-Block (drin)
- **Nützlich:** Blog / FAQ / Lösungs-Datenbank _(geparkt: zu pflegeintensiv)_
- **Community:** Freundes-Hub / Bot _(geparkt: Backend/Moderation)_

## Offene Fragen

- **Kontaktwege**: noch offen – wird mit Dennis besprochen. Im Build vorerst als **Platzhalter** umgesetzt, später leicht einsetzbar.
- _(geklärt: Position = Feldspieler; Tonalität = verspielt, aber glaubwürdig)_

## Nächste Schritte

- ✔ **Bauplan erstellt** → siehe separates Dokument **"dankdennis_bauplan.md"**.
- Mit Dennis die **Kontaktwege** abstimmen → in den Platzhalter eintragen.
- Optional: ersten funktionierenden HTML-**Prototyp** bauen lassen.
- Fotos optimieren (komprimieren) und als foto1–foto3 in /images ablegen.

## Erkenntnisse & Entscheidungen

- Seite = **persönliche Visitenkarte** für **Arbeitgeber + neue Bekanntschaften** (kein Kundenverkauf).
- Markenkern: **verlässlicher Teamplayer, der anpackt & Probleme löst.**
- **Fußball = Feldspieler**; Verbindung zur Marke über **Teamgeist & Verlässlichkeit** (Torwart-Idee verworfen).
- **Fotos vorhanden** (Werkstatt + Fußball) → **foto-geführtes Design** möglich.
- **Farbwelt: Rot/Gelb (ASG Vorwärts Dessau) + warme Holztöne.**
- **Kontaktwege:** noch offen → im Build als Platzhalter.
- Statisch, wartungsarm, selbst gebaut mit Claude Code.
- Blog/Community/Wall vorerst geparkt.
