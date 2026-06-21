/**
 * counter.ts — Count-Up der „Probleme gelöst"-Zahl (M7).
 *
 * - Bindet alle Elemente mit [data-counter]; das Ziel steht in data-counter-target.
 * - Zählt beim ersten Reinscrollen via IntersectionObserver von 0 auf den Zielwert
 *   (requestAnimationFrame, easeOutCubic), formatiert deutsch (Intl → „1.337").
 * - Verbindliche Motion-Regel: bei prefers-reduced-motion: reduce wird NICHT animiert —
 *   die Zahl steht sofort auf dem Endwert (kein Observer, kein Hochzählen).
 * - No-JS/SEO-Fallback: der Endwert steht bereits im HTML. Erst wenn animiert wird,
 *   setzt das Script auf 0 zurück und zählt hoch.
 */
const formatter = new Intl.NumberFormat("de-DE");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const DURATION = 1600; // ms

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function countUp(el: HTMLElement, target: number): void {
  let start: number | null = null;

  function tick(now: number): void {
    if (start === null) start = now;
    const progress = Math.min((now - start) / DURATION, 1);
    const value = Math.round(easeOutCubic(progress) * target);
    el.textContent = formatter.format(value);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

const counters = document.querySelectorAll<HTMLElement>("[data-counter]");
for (const counter of counters) {
  const target = Number(counter.dataset.counterTarget ?? "0");

  // Endwert in jedem Fall korrekt formatiert anzeigen (Fallback + reduced-motion).
  counter.textContent = formatter.format(target);
  if (reducedMotion.matches) continue;

  counter.textContent = formatter.format(0);
  const observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        countUp(counter, target);
        obs.unobserve(entry.target); // nur einmal hochzählen
      }
    },
    { threshold: 0.4 },
  );
  observer.observe(counter);
}
