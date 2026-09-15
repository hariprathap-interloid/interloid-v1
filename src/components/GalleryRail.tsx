"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { GALLERY } from "@/content/site";

/* ==========================================================================
   THE MOMENTS RAIL — a horizontal snap carousel of office photographs,
   rendered inside LifeHere.
   ==========================================================================
   A client component only for the arrow buttons: with the scrollbar hidden,
   a desktop user would otherwise never discover the rail scrolls. Snapping
   is CSS (`snap-x snap-mandatory`) and touch scrolling is native.

   ── EASY TO GET WRONG ───────────────────────────────────────────────────
   1. KEYBOARD. A scroll container is not focusable by default. `tabIndex={0}`
      plus `role="region"` and a label make the rail a tab stop, and arrow
      keys then scroll it natively.
   2. REDUCED MOTION. `scrollBy({ behavior: "smooth" })` is a script call,
      not a CSS transition, so it ignores the media query. Read the query and
      pass "auto".
   3. ARROW STATE. Both arrows are disabled at their ends, from a scroll
      listener with a small tolerance, because `scrollLeft` is fractional at
      some zoom levels.
   4. CLEANUP. The scroll listener and ResizeObserver are removed on unmount.

   No `data-reveal` on the arrow buttons: their className depends on state,
   and React's rewrite would wipe the `is-in` class Reveal.tsx adds. */
export default function GalleryRail() {
  const rail = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    /* 2px of tolerance at both ends: `scrollLeft` is fractional at non-integer
       zoom levels and at some device pixel ratios, so `=== 0` and `=== max`
       are both unreliable. The resting position is 0 only because
       `scroll-pl-6` matches the container's `px-6` (see the note on the rail). */
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    /* Resizing changes clientWidth, which changes what "at the end" means. */
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", sync);
      ro.disconnect();
    };
  }, [sync]);

  const nudge = (dir: -1 | 1) => {
    const el = rail.current;
    if (!el) return;
    /* One card plus its gap, measured rather than hard-coded, so the step
       stays correct at every breakpoint the card width changes at. */
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    el.scrollBy({
      left: dir * step,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  const arrow =
    "grid size-11 place-items-center rounded-full border border-border bg-card text-foreground shadow-md transition-[background-color,color,opacity] duration-300 hover:bg-secondary hover:text-primary disabled:pointer-events-none disabled:opacity-35";

  return (
    <div className="mt-14">
      <div className="mb-6 flex items-end justify-between gap-6">
        <div>
          <h3 className="font-display text-xl font-bold leading-[1.35] tracking-[-0.02em] text-foreground">
            Moments, and the odd celebration
          </h3>
          <p className="mt-1.5 text-[15px] leading-[1.7] text-muted-foreground">
            Pongal, demo days, first pull requests, and a cricket standard
            nobody is proud of.
          </p>
        </div>

        {/* Hidden below `md`, where the rail is swiped. Always visible above
            it, not hover-only: hover-revealed arrows are undiscoverable, and
            the rail has no visible scrollbar to fall back on. */}
        <div className="hidden shrink-0 gap-2 md:flex">
          <button
            type="button"
            onClick={() => nudge(-1)}
            disabled={atStart}
            aria-label="Scroll to previous moments"
            className={arrow}
          >
            <Icon name="arrow" className="size-4 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => nudge(1)}
            disabled={atEnd}
            aria-label="Scroll to more moments"
            className={arrow}
          >
            <Icon name="arrow" className="size-4" />
          </button>
        </div>
      </div>

      {/* `-mx-6 px-6` lets the first and last cards sit flush with the page
          gutter while still scrolling edge to edge — without it the rail
          appears to start indented and the last card is clipped by padding.

          `scroll-pl-6` is required with that padding: without a matching
          `scroll-padding-left` the browser rests the first card at
          `scrollLeft: 24` rather than 0, so snapped cards sit under the
          padding and the "at start" check fails, leaving the previous arrow
          enabled at rest. Any padded snap container needs matching
          scroll-padding. */}
      <div
        ref={rail}
        tabIndex={0}
        role="region"
        aria-label="Photographs from the office"
        className="-mx-6 flex snap-x snap-mandatory scroll-pl-6 gap-5 overflow-x-auto px-6 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {GALLERY.map((g) => (
          <figure
            key={g.title}
            className="group relative flex aspect-[4/5] w-[76vw] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-[1.25rem] border border-border bg-card shadow-sm transition-[border-color,box-shadow] duration-300 ease-out hover:border-accent/40 hover:shadow-lg sm:w-[300px]"
          >
            {g.img ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/gallery/${g.img}`}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 size-full object-cover"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/45 to-transparent"
                  aria-hidden="true"
                />
              </>
            ) : (
              <>
                {/* The no-photo state, deliberately quieter than the bento's:
                    these are captions waiting for pictures, so the panel
                    reads as a frame rather than a finished card. */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-secondary via-card to-secondary"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--border)_1.5px,transparent_1.5px)] bg-[size:20px_20px] [-webkit-mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,#000_10%,transparent_100%)] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,#000_10%,transparent_100%)]"
                  aria-hidden="true"
                />
                <span
                  className="pointer-events-none absolute inset-x-0 top-[26%] grid place-items-center text-muted-foreground opacity-25 transition-opacity duration-500 ease-out group-hover:opacity-40 dark:opacity-50 dark:group-hover:opacity-70"
                  aria-hidden="true"
                >
                  <Icon name="image" className="size-14" />
                </span>
              </>
            )}

            <figcaption
              className={`relative p-6 ${
                g.img ? "" : "border-t border-hairline bg-card/80 backdrop-blur-sm"
              }`}
            >
              <span
                className={`mb-2.5 inline-flex w-fit rounded-full px-2.5 py-[3px] text-[11px] font-bold uppercase tracking-[0.08em] ring-1 ${
                  g.img
                    ? "bg-white/12 text-white ring-white/25 backdrop-blur-sm"
                    : "bg-accent/10 text-accent-strong ring-accent/20"
                }`}
              >
                {g.tag}
              </span>
              <p
                className={`font-display text-[17px] font-bold leading-[1.35] tracking-[-0.015em] ${
                  g.img ? "text-white" : "text-foreground"
                }`}
              >
                {g.title}
              </p>
              <p
                className={`mt-1.5 text-[14px] leading-[1.6] ${
                  g.img ? "text-white/85" : "text-muted-strong"
                }`}
              >
                {g.body}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
