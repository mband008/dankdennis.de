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
 * - Nativer Teilen-Button: nur wenn navigator.share existiert; schickt wenn möglich das
 *   Daumen-hoch-Bild als Datei mit (Web Share Level 2).
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

  let lastTrigger: HTMLElement | null = null;
  let burst: ReturnType<typeof confetti.create> | null = null;

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

  // --- Text kopieren (mit Fallback) ---
  copyBtn?.addEventListener("click", async () => {
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
  });

  // --- Nativer Teilen-Button: nur einblenden, wenn Web Share verfügbar ist ---
  if (nativeBtn && typeof navigator.share === "function") {
    nativeBtn.hidden = false;
    nativeBtn.addEventListener("click", async () => {
      const text = currentText();
      const url = shareUrl();
      try {
        // Wenn möglich, das Daumen-hoch-Bild als Datei mitschicken (Web Share Level 2).
        if (imgPath && typeof navigator.canShare === "function") {
          try {
            const res = await fetch(imgPath);
            const blob = await res.blob();
            const file = new File([blob], "dank-dennis.jpg", {
              type: blob.type || "image/jpeg",
            });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({ text, url, files: [file] });
              return;
            }
          } catch {
            // Bild-Anhang fehlgeschlagen → unten ohne Datei teilen.
          }
        }
        await navigator.share({ text, url });
      } catch (error) {
        // Abbruch durch den Nutzer ist kein Fehler.
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setFeedback("Teilen nicht möglich.");
      }
    });
  }
}
