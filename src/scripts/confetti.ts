/**
 * confetti.ts — Konfetti-Regen beim Klick auf den „Dank Dennis!"-Button (M3).
 *
 * - canvas-confetti ist self-hosted via npm (kein CDN) → bleibt datenschutzkonform.
 * - Bindet ALLE Buttons mit [data-confetti]: aktuell der Hero-CTA, später die
 *   Footer-Reprise (M9) ohne Änderung an diesem Modul.
 * - Farben kommen aus den Design-Tokens (getComputedStyle), nicht hartkodiert.
 * - Verbindliche Motion-Regel: bei prefers-reduced-motion: reduce wird KEIN Konfetti
 *   ausgelöst. Der Media-Query wird bei JEDEM Klick live geprüft (Nutzer kann umstellen).
 */
import confetti from "canvas-confetti";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/** Marken-Konfettifarben aus den CSS-Tokens lesen (Quelle der Wahrheit). */
function brandColors(): string[] {
  const styles = getComputedStyle(document.documentElement);
  return ["--color-red", "--color-yellow", "--bg"]
    .map((token) => styles.getPropertyValue(token).trim())
    .filter(Boolean);
}

function celebrate(): void {
  if (reducedMotion.matches) return;
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.7 },
    colors: brandColors(),
  });
}

const triggers =
  document.querySelectorAll<HTMLButtonElement>("[data-confetti]");
for (const trigger of triggers) {
  trigger.addEventListener("click", celebrate);
}
