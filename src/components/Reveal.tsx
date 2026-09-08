"use client";

import { useEffect } from "react";

/* Scroll reveals — DS §13.1. Mounted once; observes every [data-reveal] and
   [data-rail] on the page and adds `is-in`, exactly as the prototype did. The
   transition vocabulary itself stays in globals.css because it is driven by a
   per-element `var(--delay)`, which utilities cannot express
   (TAILWIND-MAP §3).

   threshold 0 + rootMargin, never a fractional threshold: a tall element
   cannot reach 12% of a shrunken root at 400% zoom (HANDOFF §5.6).

   The observer is disconnected on unmount. Without that, hot reload stacks a
   fresh observer on every edit (TAILWIND-MAP §4). */
export default function Reveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(
      "[data-reveal], [data-rail]",
    );

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          io.unobserve(e.target); /* once */
        });
      },
      { threshold: 0, rootMargin: "0px 0px -60px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
