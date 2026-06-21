/**
 * reveal.ts — sanfte Scroll-Reveals (M11).
 *
 * - Bindet alle Elemente mit [data-reveal]; ein IntersectionObserver setzt beim ersten
 *   Reinscrollen einmalig die Klasse .is-visible (danach unobserve). Die Animation selbst
 *   ist reines CSS (global.css, Transition auf opacity/transform). Elemente, die beim Laden
 *   schon im Viewport sind, feuern sofort.
 * - Verbindliche Motion-Regel: bei prefers-reduced-motion: reduce wird NICHT animiert. Der
 *   versteckte Startzustand greift per CSS ohnehin nur unter no-preference; defensiv setzen
 *   wir hier zusätzlich alle Elemente sofort auf is-visible und brechen ab.
 * - Härtung (Inhalt darf NIE dauerhaft versteckt bleiben): Der versteckte Startzustand wird
 *   in Base.astro nur aktiviert, wenn IntersectionObserver existiert. Zusätzlich läuft hier
 *   alles in try/catch — bei jedem Fehler (oder fehlendem IntersectionObserver) werden sofort
 *   ALLE [data-reveal] sichtbar gemacht (reveal-all-Fallback).
 */
const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");

/** Alle Reveal-Elemente sofort sichtbar schalten (Fallback / reduced-motion). */
function revealAll(): void {
  for (const el of elements) el.classList.add("is-visible");
}

try {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    // Bewegung reduziert oder kein Observer verfügbar → ohne Animation alles zeigen.
    revealAll();
  } else {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target); // nur einmal revealen
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    for (const el of elements) observer.observe(el);
  }
} catch {
  // Falls irgendetwas schiefgeht: lieber alles sofort zeigen als dauerhaft verstecken.
  revealAll();
}
