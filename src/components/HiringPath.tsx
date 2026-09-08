import Icon from "./Icon";
import SectionHeading from "./SectionHeading";
import { PATH, PATH_NO } from "@/content/site";

/* "How we hire" — the same numbered-step shape as Process.tsx, on purpose.

   Ground moved from `secondary` to `background` on 2026-09-08 when LifeHere
   was inserted above it — this section had shared `secondary` with FitCheck,
   and keeping that would have made three secondary sections in a row.

   ── SHORTENED 2026-09-08 ──────────────────────────────────────────────────
   Four steps became THREE. The paid three-hour code exercise is gone: it does
   not make sense for somebody with no professional experience, and "paid" was
   a claim we could not verify either. What replaced it is a day in the office
   on a small real task — which is also the honest thing to offer for a role
   whose defining feature is that you have to be in that office every day.
   The grid is lg:grid-cols-3 to match.

   A candidate who has read /#process should recognise the rhyme: numbered
   steps, a time chip carrying the commitment rather than a schedule, and the
   total stated up front. The client-facing section says "from first call to
   production"; this one says the same thing about a hire.

   It does NOT reuse Process.tsx. That component's whole design is
   ProcessPath — a connector measured from the live `data-node` rects, with a
   comet and waypoint lighting. Reusing it would mean either inheriting a
   client component and a scroll-driven canvas for three static cards, or
   parameterising it into something neither page can be measured against. The
   shared thing here is the vocabulary, not the machinery.

   THE COUNTER-LIST IS THE POINT OF THE SECTION, and on the fresher version it
   matters more than it did on the senior one. "No training fee, ever" is the
   single most reassuring line available to somebody applying to their first
   job in a market where paid-training scams are common — and the most damaging
   to be caught contradicting.

   ⚠ Which is exactly why every timing and every promise here is
   data-placeholder. Publishing "no training fee, ever" and then charging one
   is worse for the firm than publishing nothing — it is the fabricated-proof
   failure from HANDOFF §7, aimed at the readers least able to absorb it. */
export default function HiringPath() {
  return (
    <section
      id="hiring"
      className="relative overflow-hidden border-t border-border bg-background py-28"
    >
      <div
        className="pointer-events-none absolute right-0 top-0 size-[520px] translate-x-1/3 -translate-y-1/3 rounded-full bg-accent/10 blur-[120px]"
        aria-hidden="true"
      />
      <div className="relative z-10 shell">
        <SectionHeading
          eyebrow="How we hire"
          icon="clock"
          accent="no exam hall."
          lead="A written answer at every stage, including a no. You will have seen the office and met the people before you are asked to decide anything."
        >
          Three steps,
        </SectionHeading>

        <ol
          className="grid gap-6 md:grid-cols-3"
          data-placeholder="P1: confirm the real interview process and timings"
        >
          {PATH.map((s, i) => (
            <li
              key={s.n}
              data-reveal
              style={{ "--delay": `${i * 100}ms` } as React.CSSProperties}
              className="h-full"
            >
              <div className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border bg-card p-7 shadow-sm transition-[border-color,box-shadow] duration-300 ease-out hover:border-accent/40 hover:shadow-lg">
                {/* The numeral is Process's device — oversized, low-opacity,
                    behind the content. Decorative here (the <ol> already
                    numbers these for a screen reader), hence aria-hidden.

                    ── IT WAS CLIPPED, AND THAT WAS A COPY-PASTE ────────────
                    At `-right-3 -top-4` it sat OUTSIDE the card's box, and
                    this card has `overflow-hidden` to round its corners — so
                    the glyph rendered with its right edge sliced off, on all
                    three cards. Process gets away with negative offsets
                    because its numeral hangs off an unclipped node, not a
                    clipped card. Positive insets keep the whole glyph inside
                    the padding, which is the only version that reads. */}
                {/* SIGNATURE — the step number is what lights up. It sits at
                    9% at rest, which is a watermark; on hover it comes up to
                    28%, which is legible, so the card reads as "this is the
                    step you are on". Opacity only: nothing about the glyph's
                    box changes, and `pointer-events-none` means it cannot
                    steal the hover from the card underneath it. */}
                <span
                  className="pointer-events-none absolute right-5 top-3 select-none font-display text-[64px] font-bold leading-none text-brand opacity-[0.09] transition-opacity duration-500 ease-out group-hover:opacity-[0.28]"
                  aria-hidden="true"
                >
                  {s.n}
                </span>

                <span className="relative mb-5 grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand ring-1 ring-brand/15 transition-colors duration-300 group-hover:bg-brand group-hover:text-primary-foreground">
                  <Icon name={s.k} className="size-6" />
                </span>

                <span className="relative mb-3 w-fit rounded-full bg-background px-2.5 py-[3px] text-[11px] font-bold uppercase tracking-[0.08em] text-accent-strong ring-1 ring-border transition-[box-shadow] duration-300 group-hover:ring-accent/30">
                  {s.when}
                </span>

                <h3 className="relative mb-3 font-display text-xl font-bold leading-[1.35] tracking-[-0.02em] text-foreground">
                  {s.title}
                </h3>
                <p className="relative text-[15px] leading-[1.7] text-muted-strong">
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {/* The disclaimers, on a dark slab so they read as a separate object
            rather than a fifth step. `on-dark` is not needed — nothing here is
            focusable — but the colours are the slab's own (--spark), not
            --accent, for the reason CtaAnchor documents: brand cyan goes muddy
            on #0f172b. */}
        <div
          data-reveal
          style={{ "--delay": "420ms" } as React.CSSProperties}
          className="mt-10"
        >
          <div
            className="relative overflow-hidden rounded-[1.5rem] bg-ink px-8 py-8 shadow-[0_25px_50px_-12px_rgba(15,23,43,.28)]"
            data-placeholder="P1: confirm each of these three is actually true"
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-brand/35 via-ink to-ink"
              aria-hidden="true"
            />
            {/* HEADING ABOVE, NOT BESIDE (refactored 2026-09-08). It was
                `lg:flex-row lg:justify-between` with the heading capped at
                `max-w-xs` and the three items in ONE column on the right —
                which left roughly a third of a 1216px slab empty down the
                middle, with the longest item wrapping in a narrow column at
                the same time. Stacking the heading frees the full width for a
                three-up row, so every item gets ~370px and fits on one or two
                lines, and the slab has no hole in it.

                Dropping from four items to three is what made the old layout
                fail: at four they filled a 2×2 beside the heading. */}
            <div className="relative z-10">
              <p className="mb-6 font-display text-lg font-bold leading-[1.4] text-white">
                And three things that will never happen to you here.
              </p>
              <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-3">
                {PATH_NO.map((n) => (
                  <li
                    key={n}
                    /* items-START, not items-center: the longest of the three
                       wraps to two lines at this width and a centred tick
                       would float against the middle of the block. */
                    className="flex items-start gap-2.5 text-[15px] leading-[1.6] text-ink-foreground"
                  >
                    <span className="mt-1 shrink-0 text-spark" aria-hidden="true">
                      <Icon name="check" className="size-4" />
                    </span>
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
