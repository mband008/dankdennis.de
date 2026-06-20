# dankdennis.de — Bauplan / Build-Brief

_Konkrete Vorlage zum Umsetzen (z. B. mit Claude Code). Alle Texte sind Vorschläge – anpassen, wie's für Dennis passt._

## Auf einen Blick

- **Was:** persönliche One-Page-Visitenkarte für Dennis.
- **Für wen:** potenzielle Arbeitgeber _und_ neue Bekanntschaften. Kein Verkauf, kein Auftrags-Pitch.
- **Tonalität:** verspielt & augenzwinkernd, aber glaubwürdig. Bodenständiger Handwerker, Teamplayer.
- **Roter Faden:** „Dank Dennis" – der, der anpackt und Probleme löst. Handwerk + Fußball + Meme.

## Farbwelt (Vorschlag – an Trikot/Geschmack anpassen)

- **Primär · Rot:** kräftiges Vereinsrot, z. B. `#C81E1E` (genau ans ASG-Vorwärts-Dessau-Trikot angleichen).
- **Akzent · Gelb:** warmes Gelb, z. B. `#F2B705` (sparsam: Highlights, Hover-Effekte, Counter).
- **Basis · Holz/Warm:** Hintergrund warmes Off-White `#F7F3EC`; dunkle Sektionen Espresso-Braun `#2A211B`.
- **Text:** fast-Schwarz `#1C1916` auf hell, Off-White auf dunkel.
- **Idee:** Werkstatt-Sektionen warm/holzig halten, Fußball-Sektion mit rot/gelbem Akzent – so haben beide Welten ihren eigenen Ton, bleiben aber verwandt.

## Typografie (Vorschlag)

- **Headlines:** kräftige, charakterstarke Sans (z. B. _Anton_, _Archivo Black_ oder _Bricolage Grotesque_) – vor allem für das große „Dank Dennis".
- **Fließtext:** ruhige, gut lesbare Sans (z. B. _Inter_).
- Google Fonts reichen völlig.

## Technik

- **Stack:** statische Seite, **pures HTML + CSS + JS**, ein Ordner, kein Build-Step (am wartungsärmsten). _Alternative für mehr Komfort: Astro._
- **Dateien:** `index.html`, `style.css`, `script.js`, Ordner `/images`.
- **Responsive:** mobile-first; gut auf Handy _und_ Desktop.
- **Hosting:** Cloudflare Pages / Netlify / GitHub Pages (kostenlos, Auto-Deploy aus Git). Danach Domain `dankdennis.de` draufzeigen.
- **Fotos:** vor dem Einbauen komprimieren (z. B. Squoosh/TinyPNG), für untere Bilder `loading="lazy"`.

## Die Seite – Abschnitt für Abschnitt

_Foto-Legende: foto1 = Werkstatt-Action · foto2 = lachendes Porträt · foto3 = Fußball-Feldaction._

### 1. Hero (Above the fold)

- **Layout:** Split – links Text, rechts großes Hochformat-Bild (**foto1**). Auf dem Handy: Bild oben, Text darunter.
- **Headline (riesig):** `Problem? Dank Dennis.`
- **Untertitel:** `Tischler aus Überzeugung, Fußballer aus Leidenschaft – und der Typ, der einfach anpackt.`
- **Button:** `Dank Dennis!` → löst beim Klick einen Konfetti-Regen aus. Kleiner Hinweis darunter: `(probier's aus)`.

### 2. Über (Wer ist Dennis)

- **Layout:** Split – **foto2** neben dem Text.
- **Heading:** `Hi, ich bin Dennis.`
- **Text (Vorschlag):**
  > Gelernter Tischler, im Hauptberuf Teil eines Schreiner-Teams im Ladenbau – wir bauen die Einrichtungen, die du später in Geschäften wiederfindest. Ich mag den Moment, in dem aus Holz und einer Idee etwas Echtes wird, das hält.
  >
  > Der Name dieser Seite? Ein alter Insider: Immer wenn irgendwo ein Problem gelöst war, hieß es „Dank Dennis". Irgendwann lag die Domain dazu auf dem Tisch – jetzt steht eben was drauf.

### 3. In der Werkstatt (Handwerk)

- **Layout:** großes Bild (**foto1**, später ggf. 2–3 Werkstatt-Shots als Galerie), kurzer Text.
- **Heading:** `In der Werkstatt`
- **Text (Vorschlag):**
  > Vom groben Zuschnitt bis zur sauberen Verbindung: Präzision ist für mich kein Extra, sondern der Standard. Was ich anpacke, soll funktionieren – und gut aussehen.
- _Hinweis: hier später echte Fotos von Dennis in diesem Look einsetzen._

### 4. Abseits der Werkstatt (Fußball)

- **Layout:** Sektion mit rot/gelbem Akzent; **foto3** als dynamischer Hingucker.
- **Heading:** `Abseits der Werkstatt`
- **Text (Vorschlag):**
  > Wenn ich nicht gerade säge, findet man mich auf dem Platz – im roten Trikot der ASG Vorwärts Dessau. Fußball ist für mich Kopf-frei-Kriegen und Teamgeist pur: Man verlässt sich aufeinander, jeder gibt alles, und am Ende zählt, was die Mannschaft schafft. Genau die Einstellung nehme ich mit in die Werkstatt.

### 5. Counter (Probleme gelöst)

- **Layout:** breite, ruhige Sektion; eine große Zahl im Scoreboard-Stil (rot/gelb).
- **Heading:** `Probleme gelöst dank Dennis`
- **Zahl:** z. B. `1.337` – beim Reinscrollen von 0 hochzählen (kleine JS-Animation). Darunter augenzwinkernd: `…und es werden täglich mehr.`
- _Rein dekorativ/statisch, kein Backend._

### 6. Kontakt (Sag Hallo)

- **Heading:** `Sag Hallo`
- **Text (Vorschlag):** `Lust auf einen Plausch, eine Zusammenarbeit – oder willst du einfach mal Danke sagen? Meld dich.`
- **WICHTIG – Platzhalter:** Kontaktwege sind noch offen (Dennis klärt das). Vorerst als Platzhalter-Buttons anlegen, damit später nur noch Links/Adressen eingetragen werden müssen:
  > `[ E-Mail ]   [ Instagram ]   [ LinkedIn ]   [ WhatsApp ]` ← später aktivieren & füllen
- Tipp: für E-Mail reicht ein simpler `mailto:`-Link; Social als normale Links.

### 7. Footer

- Schlicht: `Dank Dennis · {aktuelles Jahr}`. Optional Mini-Easter-Egg: der Konfetti-Button taucht hier nochmal klein auf.

## Interaktionen (alles client-seitig, kein Server)

- **Konfetti-Button:** beim Klick Konfetti. Einfachste Lösung: Library `canvas-confetti` per CDN einbinden und im Click-Handler `confetti()` aufrufen.
- **Counter-Animation:** Zahl zählt hoch, sobald die Sektion sichtbar wird (IntersectionObserver + kleine Zähl-Schleife).
- Beides ist mit ein paar Zeilen JS gemacht – Claude Code schreibt das direkt.

## Startprompt für Claude Code

_In Claude Code einfügen; foto1–foto3 vorher in `/images` legen._

```text
Baue mir eine statische One-Page-Website als persönliche Visitenkarte.

Kontext:
- Person: Dennis, gelernter Tischler (arbeitet im Ladenbau, im Schreiner-Team) und
  leidenschaftlicher Fußballer (Feldspieler, ASG Vorwärts Dessau, rotes Trikot).
- Zweck: persönliche Visitenkarte für potenzielle Arbeitgeber UND neue Bekanntschaften.
  KEIN Verkauf, kein Auftrags-Pitch.
- Ton: verspielt-augenzwinkernd, aber glaubwürdig und sympathisch. Roter Faden:
  das Meme "Dank Dennis" - der, der anpackt und Probleme löst.

Technik:
- Pures HTML, CSS, JS in einem Ordner, kein Build-Step.
  Dateien: index.html, style.css, script.js, Ordner /images.
- Mobile-first, voll responsive, sauberer und kommentierter Code.

Farben:
- Primär Rot #C81E1E, Akzent Gelb #F2B705 (sparsam), Hintergrund warmes Off-White
  #F7F3EC, dunkle Sektionen #2A211B, Text #1C1916.
Schriften (Google Fonts): kräftige Display-Schrift für Headlines
(z. B. Anton oder Bricolage Grotesque), Inter für Fließtext.

Abschnitte (in dieser Reihenfolge):
1. Hero: Split-Layout, Bild images/foto1.jpg rechts. Headline "Problem? Dank Dennis."
   Untertitel "Tischler aus Überzeugung, Fußballer aus Leidenschaft - und der Typ, der
   einfach anpackt." Button "Dank Dennis!", der beim Klick Konfetti auslöst
   (Library canvas-confetti per CDN).
2. Über: Split mit images/foto2.jpg. Heading "Hi, ich bin Dennis." + 2 Absätze
   (Text liefere ich; Platzhalter ist ok).
3. Werkstatt: großes Bild images/foto1.jpg, Heading "In der Werkstatt", kurzer Text.
4. Fußball: Sektion mit rot/gelbem Akzent, Bild images/foto3.jpg,
   Heading "Abseits der Werkstatt", kurzer Text.
5. Counter: große Zahl im Scoreboard-Stil "1337", die beim Reinscrollen von 0 hochzählt
   (IntersectionObserver). Heading "Probleme gelöst dank Dennis", darunter
   "…und es werden täglich mehr."
6. Kontakt: Heading "Sag Hallo" + kurzer Text. Kontakt-Buttons (E-Mail, Instagram,
   LinkedIn, WhatsApp) als Platzhalter anlegen, aber noch ohne echte Links - ich trage
   sie später ein.
7. Footer: "Dank Dennis · <aktuelles Jahr>".

Bitte alles in einem Rutsch erstellen und mir kurz erklären, wie ich es lokal anschaue
und später bei Cloudflare Pages oder Netlify hochlade.
```

## Offene Punkte vor dem Launch

- Kontaktwege mit Dennis klären → in Abschnitt 6 eintragen.
- Echte Werkstatt-Fotos in diesem Look besorgen (die aktuellen sind Stil-Referenz).
- Counter-Zahl festlegen (eine Spaß-Zahl reicht).
- Rot exakt ans Trikot angleichen.
