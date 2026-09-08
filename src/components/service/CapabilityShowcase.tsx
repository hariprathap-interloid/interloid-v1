"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "../Icon";
import SectionHeading from "../SectionHeading";
import Diagram from "./Diagrams";
import TechLogo from "./TechLogo";
import { CAPABILITIES } from "@/content/service";
import { HUE } from "@/content/site";

/* ==========================================================================
   THE CAPABILITIES — a scroll-linked showcase.
   ==========================================================================
   This is the page's signature interaction and the one section that had to be
   invented rather than adapted.

   The reference pages give each capability its own full-height block with the
   copy on one side and a bespoke diagram on the other, sides alternating
   (SERVICE-PAGE-RESEARCH.md §1). That pairing is the best thing about them and
   the reason they read as technical rather than promotional. Its weakness is
   that five near-identical blocks in a row become a scroll with nothing to
   do — §3.4.

   So: the copy blocks scroll normally in the left column, and the diagram
   panel on the right is STICKY and cross-fades to whichever capability is
   being read. The reader gets the same one-diagram-per-capability pairing, but
   the diagram is a single stable object that transforms — which is both more
   interesting and less tiring than five hand-offs. The index inside the panel
   doubles as a progress indicator and a jump list.

   ── HOW THE ACTIVE INDEX IS DECIDED ──────────────────────────────────────
   One IntersectionObserver over the five copy blocks with a reading band cut
   out of the middle of the viewport (`-45% / -45%`), and `threshold: 0` —
   never a fractional threshold, because a block taller than the shrunken root
   can never reach one at 400% zoom (HANDOFF §5.6). The blocks are `min-h`
   sized so exactly one occupies the band at a time.

   ── MOBILE IS A DIFFERENT COMPOSITION, NOT A SQUASHED ONE ────────────────
   Below `lg` there is no sticky panel: each block renders its own diagram
   inline, in reading order. Sticky positioning on a short viewport pins a
   panel over the very copy it illustrates. The desktop panel is `hidden
   lg:block` and the inline ones are `lg:hidden`, so only one copy of each
   diagram is ever in the accessibility tree — which is also why Diagrams.tsx
   is forbidden from using ids.

   ── REVEAL ───────────────────────────────────────────────────────────────
   Nothing here mounts or unmounts on state change: all five diagrams stay in
   the DOM and only their opacity/visibility classes change. Every
   [data-reveal] node keeps a static className.
   ========================================================================== */
export default function CapabilityShowcase({
  onStackLink,
}: {
  /** Selected the matching tab in <TechStacks> when a "whole stack" link was
      followed. TechStacks has been uncalled since the ecosystem map replaced
      it, so this has had no reader for two passes — optional now, and the
      callback is kept only so restoring TechStacks stays a one-line change. */
  onStackLink?: (i: number) => void;
}) {
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
    /* Cleanup is not optional: without it a hot reload stacks a fresh
       observer on every edit (TAILWIND-MAP §4). */
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="capabilities"
      /* NO `overflow-hidden` ON THIS SECTION, and that is deliberate. It is
         the second thing that breaks `position: sticky`: an ancestor with a
         non-visible overflow becomes the sticky element's scroll container,
         and since that box never scrolls, the panel just scrolls away with
         the page (measured: 2589px off the top). Every other section on the
         site clips its orbs at the section level; this one clips them in
         their own wrapper instead, which contains the blur just as well and
         leaves the sticky chain intact. See also layout.tsx's <body>. */
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

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          {/* ---- the copy column --------------------------------------- */}
          <div className="lg:col-span-6">
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
                  /* TWO NUMBERS, TWO JOBS. `min-h` is scroll distance for
                     the sticky panel to swap on; `py` is the separation
                     between one capability and the next. They were confused
                     once in each direction: 78vh with the content CENTRED put
                     240px of nothing between the section heading and the
                     first block, and dropping to 58vh with `py-14` then left
                     only 147px between blocks — too little for an item that
                     is a heading, three paragraphs and a list.

                     `justify-start` keeps the slack below the text instead of
                     splitting it above and below, and the separation is `py`
                     now, where it can be read as separation. */
                  className="flex scroll-mt-32 flex-col justify-center border-b border-border py-12 last:border-b-0 lg:min-h-[58vh] lg:justify-start lg:border-b-0 lg:py-24"
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
                    className="font-display text-3xl font-medium leading-[1.12] tracking-[-0.025em] text-foreground md:text-4xl"
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

                  {/* The diagram, inline — mobile and tablet only.

                      THE `lg:hidden` IS ON THE INNER NODE, AND THAT IS
                      LOAD-BEARING. Putting it on the [data-reveal] element
                      itself makes that element `display:none` at lg, where an
                      IntersectionObserver never fires for it — it has no box
                      to intersect with. It would then sit at `opacity: 0`
                      forever, which is invisible at lg (so nothing looks
                      wrong) but leaves five permanently-unrevealed nodes in
                      the page and fails any reveal audit. The wrapper stays
                      displayed and collapses to zero height instead. */}
                  <div
                    data-reveal
                    style={{ "--delay": "200ms" } as React.CSSProperties}
                  >
                    <div className="relative mt-8 overflow-hidden rounded-[1.5rem] border border-border bg-card p-4 shadow-sm lg:hidden">
                      <div
                        className={`pointer-events-none absolute right-0 top-0 size-48 -translate-y-1/3 translate-x-1/3 rounded-full blur-[70px] ${h.glow}`}
                        aria-hidden="true"
                      />
                      <div className="relative aspect-[7/5] w-full">
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
                  {/* The live site's own outcome bullets. `ph` marks the ones
                      whose numbers are unverified — the component renders the
                      flag so `npm run verify` and the placeholder toggle count
                      them; site.ts's banner lists which and why. */}
                  <ul className="mt-4 space-y-3">
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
                          <Icon name="check" className="size-4" />
                        </span>
                        <span {...(o.ph ? { "data-placeholder": o.ph } : {})}>
                          {o.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Technology supports the story rather than being it: the
                      marks sit UNDER the argument, small, and the capability
                      whose stack is the client's own carries none. */}
                  {/* A TASTE of the stack, not the stack: the first group's
                      marks, then a link into the full tabbed section below.
                      Technology supports the story here; #technologies is
                      where it gets to be the subject. */}
                  <div
                    data-reveal
                    style={{ "--delay": "460ms" } as React.CSSProperties}
                    className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2"
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
                      onClick={() => onStackLink?.(i)}
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
          <div className="hidden lg:col-span-6 lg:block">
            <div className="sticky top-28">
              <div className="relative overflow-hidden rounded-4xl border border-border bg-card p-8 shadow-[0_30px_80px_-15px_rgba(15,23,42,.12)] ring-1 ring-foreground/5">
                {/* h.glow is a whole class string — never composed at runtime
                    (site.ts's HUE banner). */}
                {CAPABILITIES.map((c, i) => (
                  <div
                    key={c.k}
                    className={`pointer-events-none absolute right-0 top-0 size-72 -translate-y-1/3 translate-x-1/3 rounded-full blur-[90px] transition-opacity duration-500 ${
                      HUE[c.hue].glow
                    } ${i === active ? "opacity-100" : "opacity-0"}`}
                    aria-hidden="true"
                  />
                ))}

                {/* The stage. A fixed aspect box so the panel never resizes
                    between capabilities — a jumping sticky panel is the fastest
                    way to make a scroll-linked section feel broken. */}
                <div className="relative aspect-[7/5] w-full">
                  {CAPABILITIES.map((c, i) => (
                    <div
                      key={c.k}
                      aria-hidden={i !== active}
                      /* DS §8.4's panel swap: opacity 0→1, blur(10px)→0,
                         y 20→0, ~400ms. `invisible` keeps the inactive
                         diagrams out of the a11y tree and off the pointer. */
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

                {/* The index: progress, and a jump list. Anchors rather than
                    buttons — each target is a real element with an id, so
                    these work with JS off and are shareable. */}
                <nav
                  aria-label="Capabilities"
                  className="mt-8 border-t border-hairline pt-6"
                >
                  <ul className="flex flex-wrap gap-2">
                    {CAPABILITIES.map((c, i) => {
                      const on = i === active;
                      return (
                        <li key={c.k}>
                          <a
                            href={`#capability-${c.k}`}
                            aria-current={on ? "true" : undefined}
                            /* Set it immediately rather than waiting for the
                               observer. A jump lands the target block at the
                               top of the viewport, which is ABOVE the reading
                               band, so the observer would not fire until the
                               reader scrolled further — leaving the panel
                               showing the capability they just navigated away
                               from. The observer still owns scrolling. */
                            onClick={() => setActive(i)}
                            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-all duration-300 ${
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
