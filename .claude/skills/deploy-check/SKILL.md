---
name: deploy-check
description: Pre-Deploy-Checkliste für das Coolify-Static-Deploy von dankdennis.de — npm run verify grün, Build erzeugt dist/, Meta/OG/Favicon vorhanden, Build-Command + Publish-Dir korrekt, pre-push-Gate aktiv. Nutzen vor einer Übergabe an den Menschen für den Push auf main / vor einem Deploy.
---

# deploy-check

Letzter Check, bevor Claude den grünen Branch lokal nach `main` merged (`--no-ff`) und dem
Menschen meldet, dass `main` push-bereit ist (Coolify deployt nach dem Push automatisch).
Claude merged lokal, aber pusht/pullt nie selbst.

## Checkliste

1. **Grün lokal**: `npm run verify` (astro check + prettier + build + Playwright) ohne Fehler.
2. **Build erzeugt `dist/`**: `npm run build` läuft durch, `dist/index.html` existiert,
   Assets unter `dist/_astro/` (optimierte Bilder + gebündelte, self-hosted Fonts).
3. **Keine externen Font-Requests**: weiterhin nichts an googleapis/gstatic (Smoke-Test deckt das ab).
4. **Meta/SEO**: `<title>`, `description`, Open-Graph-Tags gesetzt (in `Base.astro`);
   ab M11 zusätzlich OG-Image + Favicon unter `public/`.
5. **`prefers-reduced-motion`**: Konfetti/Counter respektieren `reduce` (Specs grün).
6. **Test-Gate aktiv**: `git config core.hooksPath` == `.githooks`; `.githooks/pre-push`
   ist ausführbar. Beim manuellen Push auf `main` erzwingt es `npm run verify`.

## Coolify-Einstellungen (Static Build)

- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Auto-Deploy**: Webhook bei Push auf `main` (der Push kommt vom Menschen).
- **Domain + SSL**: `dankdennis.de` über Coolify (Let's Encrypt).

## Übergabe

- Branch grün → lokal mit `git merge --no-ff` nach `main` mergen, dann melden:
  „`main` ist push-bereit." Den Push macht der Mensch.
- Der native `pre-push`-Hook ist das harte Gate: ein roter Build verhindert den Push.
