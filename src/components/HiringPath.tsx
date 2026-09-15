import Icon from "./Icon";
import SectionHeading from "./SectionHeading";
import { PATH, PATH_NO } from "@/content/site";

/* "How we hire" — three numbered steps, visually rhyming with the home
   page's process section.

   It deliberately does not reuse Process.tsx: that component is built around
   a scroll-driven connector measured from live node rects, which is far too
   much machinery for three static cards. The shared thing is the visual
   vocabulary, not the code.

   Ground is `bg-background` to keep the section grounds alternating on
   /careers.

   The dark slab of things that will never happen (e.g. a training fee) is
   the most reassuring content here, and the most damaging to be caught
   contradicting. Copy marked data-placeholder is unverified; confirm before
   public launch. */
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
                {/* The oversized step numeral, behind the content. Decorative
                    (the <ol> already numbers these), hence aria-hidden.
                    Positive insets keep it inside the padding: the card is
                    `overflow-hidden`, and a half-cropped numeral reads as
                    broken.

                    Signature: it rises from 9% (watermark) to 28% (legible)
                    on hover. Opacity only, and `pointer-events-none` so it
                    cannot steal the hover from the card. */}
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
            rather than another step. Icons use --spark, not --accent: the
            brand cyan goes muddy on the ink ground. */}
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
            {/* Heading above, not beside: stacking frees the full width for a
                three-up row, so each item fits on one or two lines and the
                slab has no empty column. */}
            <div className="relative z-10">
              <p className="mb-6 font-display text-lg font-bold leading-[1.4] text-white">
                And three things that will never happen to you here.
              </p>
              <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-3">
                {PATH_NO.map((n) => (
                  <li
                    key={n}
                    /* items-start: when an item wraps, a centred tick would
                       float against the middle of the block. */
                    className="flex items-start gap-2.5 text-[15px] leading-[1.6] text-ink-foreground"
                  >
                    <span className="mt-1 shrink-0 text-spark" aria-hidden="true">
                      <Icon name="check-circle" className="size-4" />
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
