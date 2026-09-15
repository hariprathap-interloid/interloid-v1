import SectionHeading from "./SectionHeading";
import { CLAUSES } from "@/content/site";

/* The working agreement, shaped like a document rather than a card grid: one
   bordered sheet, a titled head, numbered clauses divided by rules, and a foot
   naming the legal entity. The page's claim is "we put it in the contract", so
   the block looks like one.

   - Each figure is a dashed-border chip so it reads as a margin annotation,
     not a spreadsheet cell; the third column is `auto` to fit the chip.
   - The head is a small uppercase label, not a display-font title, so it does
     not compete with the H2 above it.
   - The documentary feel comes from uppercase + wide tracking; the type system
     deliberately has no monospace face.

   Copy marked data-placeholder is unverified; confirm before public launch. */
export default function Clauses() {
  return (
    <section
      id="agreement"
      className="relative overflow-hidden border-t border-border bg-background py-32"
    >
      <div
        className="pointer-events-none absolute right-0 top-0 size-[520px] -translate-y-1/3 translate-x-1/3 rounded-full bg-accent/10 blur-[120px]"
        aria-hidden="true"
      />
      <div className="relative z-10 shell">
        <SectionHeading
          eyebrow="The commitments"
          icon="doc"
          accent="in plain language."
          lead="Five clauses that shape every engagement. The contract version says the same things with more commas."
        >
          The working agreement,
        </SectionHeading>

        <div
          data-reveal
          /* The sheet is the page's hero object, so it carries feature-panel
             elevation — big radius, hairline ring, one deep soft shadow —
             instead of a card's shadow-sm. It spans the full container; the
             prose inside caps its own measure. */
          className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_30px_80px_-15px_rgba(0,0,0,0.1)] ring-1 ring-foreground/5"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border bg-secondary px-6 py-6 sm:px-8 md:px-12">
            <h3 className="text-[13px] font-bold uppercase tracking-[0.14em] text-foreground">
              Working agreement: summary of terms
            </h3>
            <span className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              Applies to every engagement
            </span>
          </div>

          {CLAUSES.map((c) => (
            <article
              key={c.n}
              /* `last:border-b-0` rather than a divider utility on the parent:
                 the head and foot are also bordered, and a `divide-y` would
                 have doubled up against both. */
              className="group grid items-start gap-x-10 gap-y-4 border-b border-border px-6 py-9 transition-colors duration-200 last:border-b-0 hover:bg-secondary/60 sm:px-8 md:grid-cols-[9rem_1fr_auto] md:px-12 md:py-10"
            >
              <span className="relative flex flex-col gap-1 pt-0.5">
                {/* Ghost numeral, sitting BEHIND the id labels —
                    near-invisible at rest, warming toward the accent on row
                    hover. Decorative: the readable "Clause NN" follows. */}
                <span
                  className="pointer-events-none absolute -top-7 -left-1 hidden select-none font-display md:block text-[72px] font-bold leading-none text-foreground/5 transition-colors duration-500 group-hover:text-accent/10"
                  aria-hidden="true"
                >
                  {c.n}
                </span>
                <span className="relative text-xs font-bold uppercase tracking-[0.12em] text-accent-strong">
                  Clause {c.n}
                </span>
                <span className="relative text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {c.label}
                </span>
              </span>

              <div>
                <h4 className="mb-2.5 font-display text-xl font-bold leading-[1.35] tracking-[-0.02em] text-foreground">
                  {c.title}
                </h4>
                {/* Capped for a readable measure inside the full-width sheet. */}
                <p className="max-w-2xl leading-[1.7] text-muted-foreground">
                  {c.body}
                </p>
              </div>

              {/* aria-hidden: the figure restates the prose beside it, so a
                  screen reader would hear the same fact twice. The dashed
                  border makes it read as an annotation in the document's
                  margin. */}
              <div
                className="justify-self-start whitespace-nowrap rounded-xl border border-dashed border-border bg-secondary px-4 py-2.5 text-right md:justify-self-end"
                aria-hidden="true"
              >
                <strong className="block font-display text-lg font-bold leading-tight text-primary">
                  {c.figure}
                </strong>
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  {c.caption}
                </span>
              </div>
            </article>
          ))}

          <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-border bg-secondary px-6 py-7 text-[13px] text-muted-foreground sm:px-8 md:px-12">
            <span data-placeholder="P1: verify the engagement contract actually carries these clauses">
              <strong className="font-semibold text-foreground">
                Interloid Technologies Private Limited
              </strong>{" "}
              carries these clauses into every engagement agreement.
            </span>
            <span>India-based &middot; US &amp; UK overlap hours</span>
          </div>
        </div>
      </div>
    </section>
  );
}
