"use client";

import { useEffect } from "react";

/* Scroll reveals. Mounted once per page; adds `is-in` to every [data-reveal]
   and [data-rail] as it enters view, or immediately under reduced motion. The
   transitions live in globals.css because they use a per-element
   `var(--delay)`.

   threshold 0 + rootMargin, never a fractional threshold: a tall element
   cannot reach a fraction of a shrunken root at 400% zoom. */
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
