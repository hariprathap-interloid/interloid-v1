import SectionHeading from "./SectionHeading";
import { QUOTES } from "@/content/site";

/* Client feedback grid. The attribution is pinned to the bottom (mt-auto) so
   cards of different lengths still line up. The pull-quote is a separate
   section (PullQuote.tsx): it is a slogan, not a fourth testimonial.

   Copy marked data-placeholder is unverified; confirm before public launch. */
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
            /* Wrapper reveals, figure hovers. `[data-reveal]` is unlayered in
               globals.css and out-ranks any transition utility on its own
               element, which would make the hover snap. */
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
