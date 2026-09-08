import SectionHeading from "./SectionHeading";
import { QUOTES } from "@/content/site";

/* DS §8.3 — client feedback, converted from prototype/ (hand-CSS → tokens).

   ⚠ EVERY QUOTE HERE IS A PLACEHOLDER AND MUST NOT SHIP AS-IS.
   HANDOFF §7 P0: this is the same bucket as the case studies. A testimonials
   block showing "Placeholder Name · VP Product, Placeholder Co" is worse than
   having no testimonials — an empty space reads as an early company, a visibly
   fake quote reads as a company that fabricates proof, which is precisely the
   review's core finding. The section exists so the design is settled and the
   real quotes can be dropped in; it is flagged so it cannot ship by accident.

   Card design is prototype 1's `.quote`: a large quote mark, the quote at
   17px/1.7, and the attribution pinned to the bottom (mt-auto) with a
   gradient initials avatar so cards of different lengths still line up.

   THE PULL-QUOTE USED TO LIVE HERE and was moved to PullQuote.tsx on
   2026-09-07. It is not a fourth testimonial: this grid is evidence, that is a
   slogan, and hanging it off the bottom of the grid under this section's
   heading filed it as the former. Do not fold it back in. */
export default function Testimonials() {
  return (
    <section
      id="feedback"
      className="relative overflow-hidden border-t border-border bg-background py-32"
    >
      <div className="relative z-10 shell">
        <SectionHeading
          eyebrow="Client feedback"
          icon="quote"
          accent="work with us."
        >
          What it&rsquo;s like to
        </SectionHeading>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {QUOTES.map((q, i) => (
            /* Wrapper reveals, figure hovers — same split as WorkCard and
               CommitmentTile. `[data-reveal]` is unlayered in globals.css and
               out-ranks any transition utility on its own element, so this
               card's hover shadow was snapping. */
            <div
              key={i}
              data-reveal
              style={{ "--delay": `${i * 100}ms` } as React.CSSProperties}
              className="h-full"
            >
              <figure
                data-placeholder="P0 TRUST: collect 2-3 real testimonials with written permission"
                className="flex h-full flex-col rounded-[1.5rem] border border-border bg-card p-8 shadow-sm transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl"
              >
                <span className="mb-4 text-faint" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-8"
                  >
                    <path d="M9.5 4C6.5 6 5 8.7 5 12v8h7v-8H8.3c0-2.4.9-4.2 2.7-5.4L9.5 4Zm9 0c-3 2-4.5 4.7-4.5 8v8h7v-8h-3.7c0-2.4.9-4.2 2.7-5.4L18.5 4Z" />
                  </svg>
                </span>
                <blockquote className="mb-8 text-[17px] leading-[1.7] text-foreground">
                  {q.q}
                </blockquote>
                <figcaption className="mt-auto flex items-center gap-3.5">
                  <span
                    /* 13px, not the 15px `.quote__avatar` asks for. In
                     prototype 1 the sibling rule `.quote__who span` (0,1,1)
                     out-specifies `.quote__avatar` (0,1,0) and wins, so the
                     avatar RENDERS at 13px. Matched to the render, as asked —
                     change to text-[15px] for the authored intent. */
                    className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-accent font-display text-[13px] font-bold text-white"
                    aria-hidden="true"
                  >
                    {q.i}
                  </span>
                  <span>
                    <strong className="block text-[15px] font-semibold text-foreground">
                      {q.n}
                    </strong>
                    <span className="text-[13px] text-muted-foreground">
                      {q.r}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
