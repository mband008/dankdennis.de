/**
 * share.ts — Teilen-Dialog (M14).
 *
 * - Öffnet das native <dialog> (showModal) per [data-share]-Trigger (Hero-CTA „Dank
 *   Dennis!"). Schließen via Esc (nativ), Backdrop-Klick und ✕-Button; danach Fokus
 *   zurück auf den auslösenden Trigger.
 * - Konfetti-Burst beim Öffnen: canvas-confetti rendert in ein Canvas, das IM Dialog
 *   liegt → Top-Layer, also sichtbar ÜBER dem Modal-Backdrop. Verbindliche Motion-Regel:
 *   bei prefers-reduced-motion: reduce KEIN Konfetti (live geprüft).
 * - Netzwerk-Buttons bauen reine Outbound-URLs aus dem (editierbaren) Textfeld +
 *   window.location.origin und öffnen sie via window.open(…, 'noopener,noreferrer').
 *   KEINE Third-Party-Scripts/SDKs.
 * - „Text kopieren": navigator.clipboard mit try/catch-Fallback (Text markieren).
 * - Nativer Teilen-Button: nur wenn navigator.share existiert. Wichtig für die User-Geste:
 *   das Share-Bild wird BEIM ÖFFNEN vorab geladen (fetch → Blob → File, gecacht), damit der
 *   Klick-Handler navigator.share() OHNE vorheriges await aufruft (sonst frisst das fetch die
 *   transiente Aktivierung → Desktop-Browser werfen NotAllowedError). Gestufte Daten: Basis
 *   { text, url }; die Datei kommt NUR dazu, wenn navigator.canShare(...) sie akzeptiert
 *   (i. d. R. nur mobil). Fehler-Strategie: AbortError (Nutzer bricht ab) → still; sonst
 *   einmal ohne Datei erneut versuchen, dann lautlos auf „Text kopieren" zurückfallen — KEINE
 *   rote „Teilen nicht möglich"-Meldung für ein Bonus-Feature.
 */
import confetti from "canvas-confetti";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const dialog = document.querySelector<HTMLDialogElement>("#share-dialog");

if (dialog) {
  const triggers = document.querySelectorAll<HTMLElement>("[data-share]");
  const textarea =
    dialog.querySelector<HTMLTextAreaElement>("[data-share-text]");
  const feedback = dialog.querySelector<HTMLElement>("[data-share-feedback]");
  const nativeBtn = dialog.querySelector<HTMLButtonElement>(
    "[data-share-native]",
  );
  const copyBtn = dialog.querySelector<HTMLButtonElement>("[data-share-copy]");
  const imgPath = dialog.dataset.shareImg ?? "";

  const nativeSupported = typeof navigator.share === "function";

  let lastTrigger: HTMLElement | null = null;
  let burst: ReturnType<typeof confetti.create> | null = null;
  // Vorab geladenes Share-Bild (für Web Share). Wird beim Öffnen gefüllt, damit der
  // Klick-Handler synchron darauf zugreift (User-Geste bleibt erhalten).
  let shareFile: File | null = null;
  let shareImagePromise: Promise<File | null> | null = null;

  /** Marken-Konfettifarben aus den CSS-Tokens (Quelle der Wahrheit). */
  function brandColors(): string[] {
    const styles = getComputedStyle(document.documentElement);
    return ["--color-red", "--color-yellow", "--bg"]
      .map((token) => styles.getPropertyValue(token).trim())
      .filter(Boolean);
  }

  /** Konfetti-Canvas einmalig IM Dialog anlegen (Top-Layer, über dem Backdrop). */
  function celebrate(): void {
    if (reducedMotion.matches || !dialog) return;
    if (!burst) {
      const canvas = document.createElement("canvas");
      canvas.className = "share__confetti";
      canvas.style.cssText =
        "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;";
      dialog.appendChild(canvas);
      burst = confetti.create(canvas, { resize: true });
    }
    burst({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.7 },
      colors: brandColors(),
    });
  }

  /** Share-Bild EINMAL laden und cachen (fetch → Blob → File). Fehlschlag ist ok:
   *  dann wird ohne Datei geteilt. Same-origin (public/) → kein externer Request. */
  function loadShareImage(): Promise<File | null> {
    if (!shareImagePromise) {
      shareImagePromise = (async () => {
        if (!imgPath) return null;
        try {
          const res = await fetch(imgPath);
          const blob = await res.blob();
          shareFile = new File([blob], "dank-dennis.jpg", {
            type: blob.type || "image/jpeg",
          });
          return shareFile;
        } catch {
          shareFile = null;
          return null;
        }
      })();
    }
    return shareImagePromise;
  }

  function currentText(): string {
    return (textarea?.value ?? "").trim();
  }

  function shareUrl(): string {
    return window.location.origin;
  }

  /** Plattform-spezifische Outbound-URL aus aktuellem Text + Origin. */
  function networkUrl(net: string, text: string, url: string): string | null {
    const enc = encodeURIComponent;
    switch (net) {
      case "email":
        return `mailto:?subject=${enc("Dank Dennis!")}&body=${enc(text + "\n\n" + url)}`;
      case "whatsapp":
        return `https://wa.me/?text=${enc(text + " " + url)}`;
      case "x":
        return `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`;
      case "telegram":
        return `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`;
      case "facebook":
        return `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;
      default:
        return null;
    }
  }

  function setFeedback(message: string): void {
    if (!feedback) return;
    feedback.textContent = message;
  }

  function open(trigger: HTMLElement): void {
    lastTrigger = trigger;
    setFeedback("");
    dialog?.showModal();
    celebrate();
    // Share-Bild vorab laden, damit es beim Klick auf „Mehr…" schon bereit ist
    // (nur sinnvoll, wenn Web Share überhaupt verfügbar ist).
    if (nativeSupported) void loadShareImage();
  }

  // --- Trigger: Dialog öffnen + Konfetti ---
  for (const trigger of triggers) {
    trigger.addEventListener("click", () => open(trigger));
  }

  // --- Schließen: Backdrop-Klick (Klick außerhalb der Karte) ---
  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    // Klicks auf das Backdrop liegen außerhalb des Dialog-Rechtecks.
    if (!inside && event.target === dialog) dialog.close();
  });

  // --- Schließen: Fokus zurück auf den Trigger (Esc/✕/Backdrop laufen alle hier durch) ---
  dialog.addEventListener("close", () => {
    lastTrigger?.focus();
  });

  // --- Netzwerk-Buttons: Outbound-URL im neuen Tab ---
  const netButtons =
    dialog.querySelectorAll<HTMLButtonElement>("[data-share-net]");
  for (const button of netButtons) {
    button.addEventListener("click", () => {
      const net = button.dataset.shareNet ?? "";
      const url = networkUrl(net, currentText(), shareUrl());
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  // --- Text kopieren (mit Fallback) — auch der letzte Ausweg fürs native Teilen ---
  async function copyToClipboard(): Promise<void> {
    const payload = `${currentText()} ${shareUrl()}`;
    try {
      await navigator.clipboard.writeText(payload);
      setFeedback("Kopiert! 🎉");
    } catch {
      // Fallback: Textfeld markieren, damit der Nutzer manuell kopieren kann.
      if (textarea) {
        textarea.focus();
        textarea.select();
      }
      setFeedback("Text markiert – mit Strg/Cmd + C kopieren.");
    }
  }

  const isAbort = (error: unknown): boolean =>
    error instanceof DOMException && error.name === "AbortError";

  copyBtn?.addEventListener("click", () => void copyToClipboard());

  // --- Nativer Teilen-Button: nur einblenden, wenn Web Share verfügbar ist ---
  if (nativeBtn && nativeSupported) {
    nativeBtn.hidden = false;
    nativeBtn.addEventListener("click", async () => {
      const base: ShareData = { text: currentText(), url: shareUrl() };

      // Gestufte Daten: Datei NUR mitschicken, wenn sie schon geladen ist UND
      // canShare(...inkl. Datei) sie akzeptiert (i. d. R. nur mobil). KEIN await vor
      // share() → die User-Geste bleibt erhalten.
      const withFile: ShareData =
        shareFile &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ ...base, files: [shareFile] })
          ? { ...base, files: [shareFile] }
          : base;

      try {
        await navigator.share(withFile);
      } catch (error) {
        if (isAbort(error)) return; // Nutzer hat abgebrochen → still.
        // Graceful Fallback: war eine Datei dabei, einmal ohne Datei erneut versuchen …
        if (withFile.files?.length) {
          try {
            await navigator.share(base);
            return;
          } catch (retryError) {
            if (isAbort(retryError)) return;
          }
        }
        // … scheitert auch das, lautlos auf „Text kopieren" zurückfallen.
        await copyToClipboard();
      }
    });
  }
}
