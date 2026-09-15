"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "../Icon";
import SectionHeading from "../SectionHeading";
import Diagram from "./Diagrams";
import TechLogo from "./TechLogo";
import { CAPABILITIES } from "@/content/service";
import { HUE } from "@/content/site";

/* ==========================================================================
   CAPABILITIES — a scroll-linked showcase.
   ==========================================================================
   Copy blocks scroll in the left column; the diagram panel on the right is
   sticky and cross-fades to whichever capability is being read. The index in
   the panel doubles as a progress indicator and a jump list.

   ── ACTIVE INDEX ─────────────────────────────────────────────────────────
   One IntersectionObserver over the copy blocks with a reading band cut out
   of the middle of the viewport (`-45% / -45%`) and `threshold: 0`. Never a
   fractional threshold: a block taller than the shrunken root can never
   reach one at high zoom. Blocks are `min-h` sized so one occupies the band
   at a time.

   ── BELOW `xl` ───────────────────────────────────────────────────────────
   No sticky panel: each block renders its diagram inline, in reading order.
   The panel is `hidden xl:block` and the inline copies are `xl:hidden`, so
   only one copy of each diagram is in the accessibility tree — and why
   Diagrams.tsx must not use ids.

   The split is at `xl` because the diagrams' 10px viewBox labels become
   unreadable in a half-width panel below ~1280px. `max-w-3xl` on the text
   and inline diagram keeps line length and diagram height sane across the
   full-width `lg` band; it is inert at `xl`. The `xl` split is 5/7 because
   the copy is capped at `max-w-xl` while the diagram uses every pixel.

   ── REVEAL ───────────────────────────────────────────────────────────────
   Nothing mounts or unmounts on state change: all diagrams stay in the DOM
   and only their opacity/visibility classes change. Every [data-reveal] node
   keeps a static className.
   ========================================================================== */
export default function CapabilityShowcase() {
  const [active, setActive] = useState(0);
  const blocks = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const els = blocks.current.filter(Boolean) as HTMLElement[];
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const i = Number((e.target as HTMLElement).dataset.capIndex);
          if (!Number.isNaN(i)) setActive(i);
        });
      },
      { threshold: 0, rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => io.observe(el));
    /* Without cleanup, every remount (including hot reload) stacks another
       observer. */
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="capabilities"
      /* No `overflow-hidden` on this section: an ancestor with non-visible
         overflow becomes the sticky panel's scroll container and breaks
         `position: sticky`. The orbs clip in their own wrapper instead. */
      className="relative border-t border-border bg-secondary py-32"
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute left-0 top-1/4 size-[560px] -translate-x-1/3 rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="relative z-10 shell">
        <SectionHeading
          eyebrow="What we do"
          icon="layers"
          accent="for modern businesses."
          lead="Six services, one team, and the same senior engineers from the first call to handover. Each is drawn here as the mechanism it actually is, so you can judge the engineering rather than the adjective."
          className="max-w-3xl"
        >
          Full-stack development
        </SectionHeading>

        <div className="grid gap-10 xl:grid-cols-12 xl:gap-16">
          {/* ---- the copy column --------------------------------------- */}
          <div className="xl:col-span-5">
            {CAPABILITIES.map((c, i) => {
              const h = HUE[c.hue];
              return (
                <article
                  key={c.k}
                  ref={(el) => {
                    blocks.current[i] = el;
                  }}
                  data-cap-index={i}
                  id={`capability-${c.k}`}
                  /* `min-h` is scroll distance for the sticky panel to swap
                     on; `py` is the separation between capabilities.
                     `justify-start` keeps the slack below the text rather
                     than splitting it above and below. */
                  className="flex scroll-mt-32 flex-col justify-center border-b border-border py-12 last:border-b-0 xl:min-h-[58vh] xl:justify-start xl:border-b-0 xl:py-24"
                >
                  <div
                    data-reveal
                    className="mb-6 flex items-center gap-3"
                  >
                    <span
                      className={`grid size-12 shrink-0 place-items-center rounded-2xl text-white shadow-lg ${h.tile}`}
                    >
                      <Icon name={c.icon} className="size-6" />
                    </span>
                    <span>
                      <span
                        className={`block text-[11px] font-bold uppercase tracking-[0.14em] ${h.text}`}
                      >
                        {c.name}
                      </span>
                      <span className="block font-display text-sm font-bold tabular-nums text-muted-foreground">
                        0{i + 1} / 0{CAPABILITIES.length}
                      </span>
                    </span>
                  </div>

                  <h3
                    data-reveal
                    style={{ "--delay": "80ms" } as React.CSSProperties}
                    className="max-w-3xl font-display text-3xl font-medium leading-[1.12] tracking-[-0.025em] text-foreground md:text-4xl"
                  >
                    {c.head}{" "}
                    <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
                      {c.accent}
                    </span>
                  </h3>

                  <p
                    data-reveal
                    style={{ "--delay": "160ms" } as React.CSSProperties}
                    className="mt-5 max-w-xl text-[17px] leading-[1.7] text-muted-foreground"
                  >
                    {c.body}
                  </p>

                  {/* The inline diagram, below `xl` only.

                      `xl:hidden` must be on the inner node, not the
                      [data-reveal] element: a display:none element has no box,
                      so the IntersectionObserver never fires and it stays
                      unrevealed. The wrapper stays displayed at zero height. */}
                  <div
                    data-reveal
                    style={{ "--delay": "200ms" } as React.CSSProperties}
                  >
                    <div className="relative mx-auto mt-8 max-w-3xl overflow-hidden rounded-[1.5rem] border border-border bg-card p-4 shadow-sm xl:hidden">
                      <div
                        className={`pointer-events-none absolute right-0 top-0 size-48 -translate-y-1/3 translate-x-1/3 rounded-full blur-[70px] ${h.glow}`}
                        aria-hidden="true"
                      />
                      <div className="relative aspect-[8/5] w-full">
                        <Diagram name={c.figure} />
                      </div>
                    </div>
                  </div>

                  <h4
                    data-reveal
                    style={{ "--delay": "240ms" } as React.CSSProperties}
                    className="mt-8 flex items-center gap-2 font-display text-[12px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    <Icon name="check" className="size-4 text-accent-strong" />
                    What you get
                  </h4>
                  {/* `ph` marks outcomes whose numbers are unverified; it is
                      rendered as `data-placeholder` so tooling can find them. */}
                  <ul className="mt-4 max-w-3xl space-y-3">
                    {c.outcomes.map((o, j) => (
                      <li
                        key={o.text}
                        data-reveal
                        style={
                          { "--delay": `${280 + j * 60}ms` } as React.CSSProperties
                        }
                        className="flex gap-3 text-[15px] leading-[1.7] text-muted-strong"
                      >
                        <span
                          className={`mt-1 shrink-0 ${h.text}`}
                          aria-hidden="true"
                        >
                          <Icon name="check-circle" className="size-4" />
                        </span>
                        <span {...(o.ph ? { "data-placeholder": o.ph } : {})}>
                          {o.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* A sample of the stack — the first group's marks — and a
                      link to the full #technologies section. */}
                  <div
                    data-reveal
                    style={{ "--delay": "460ms" } as React.CSSProperties}
                    className="mt-7 flex max-w-3xl flex-wrap items-center gap-x-3 gap-y-2"
                  >
                    <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Built with
                    </span>
                    <ul className="flex flex-wrap items-center gap-2">
                      {c.stack[0].items.slice(0, 6).map((t) => (
                        <li key={t.name}>
                          <TechLogo tech={t} size="sm" />
                        </li>
                      ))}
                    </ul>
                    <a
                      href="#technologies"
                      className="group/link inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary transition-colors hover:text-accent-strong"
                    >
                      the whole stack
                      <span className="transition-transform group-hover/link:translate-x-1">
                        <Icon name="arrow" className="size-4" />
                      </span>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>

          {/* ---- the sticky panel -------------------------------------- */}
          <div className="hidden xl:col-span-7 xl:block">
            {/* The panel must fit the viewport: the part of a sticky box
                below the fold is unreachable. `max-h` on the sticky element
                plus `min-h-0 shrink` on the stage lets the drawing give up
                height first — the SVG is `preserveAspectRatio: meet`, so it
                scales down rather than crops. The index is `shrink-0`. */}
            <div className="sticky top-28 flex max-h-[calc(100dvh-8rem)] flex-col">
              {/* Padding is kept tight so the panel's height goes to the
                  drawing rather than chrome. */}
              <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-4xl border border-border bg-card p-6 shadow-[0_30px_80px_-15px_rgba(15,23,42,.12)] ring-1 ring-foreground/5">
                {/* h.glow is a whole class string — never composed at runtime,
                    so Tailwind can see it. */}
                {CAPABILITIES.map((c, i) => (
                  <div
                    key={c.k}
                    className={`pointer-events-none absolute right-0 top-0 size-72 -translate-y-1/3 translate-x-1/3 rounded-full blur-[90px] transition-opacity duration-500 ${
                      HUE[c.hue].glow
                    } ${i === active ? "opacity-100" : "opacity-0"}`}
                    aria-hidden="true"
                  />
                ))}

                {/* The stage: a fixed aspect box so the panel never resizes
                    between capabilities. It only gives way when the window is
                    too short (see the max-h note above). */}
                <div className="relative aspect-[8/5] w-full min-h-0 shrink">
                  {CAPABILITIES.map((c, i) => (
                    <div
                      key={c.k}
                      aria-hidden={i !== active}
                      /* Panel swap: opacity, blur and a small rise.
                         `invisible` keeps inactive diagrams out of the a11y
                         tree and off the pointer. */
                      className={`absolute inset-0 transition-all duration-500 ease-out ${
                        i === active
                          ? "visible translate-y-0 opacity-100 blur-0"
                          : "invisible translate-y-3 opacity-0 blur-[10px]"
                      }`}
                    >
                      <Diagram name={c.figure} />
                    </div>
                  ))}
                </div>

                {/* The index. Anchors rather than buttons: each target has an
                    id, so these work without JS and are shareable. */}
                <nav
                  aria-label="Capabilities"
                  className="mt-5 shrink-0 border-t border-hairline pt-4"
                >
                  <ul className="flex flex-wrap gap-1.5">
                    {CAPABILITIES.map((c, i) => {
                      const on = i === active;
                      return (
                        <li key={c.k}>
                          <a
                            href={`#capability-${c.k}`}
                            aria-current={on ? "true" : undefined}
                            /* Set immediately: a jump lands the block above the
                               reading band, so the observer would not fire
                               until the reader scrolled further. The observer
                               still owns scrolling. */
                            onClick={() => setActive(i)}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-all duration-300 ${
                              on
                                ? "border-transparent bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                                : "border-border bg-background text-muted-foreground hover:border-accent/40 hover:text-foreground"
                            }`}
                          >
                            <Icon name={c.icon} className="size-4" />
                            {c.name}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
