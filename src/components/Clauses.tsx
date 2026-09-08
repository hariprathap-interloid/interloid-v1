import SectionHeading from "./SectionHeading";
import { CLAUSES } from "@/content/site";

/* The working agreement, ported from prototype2-archive's `.doc` / `.clause`.

   ── IT IS SHAPED LIKE A DOCUMENT ON PURPOSE ───────────────────────────────
   This is the one block on the site that is not a card grid, and that is the
   argument rather than a style choice: the page's claim is "we put it in the
   contract", so the block is built to look like the contract — one bordered
   sheet, a titled head, numbered clauses divided by rules, and a foot with the
   legal entity on it. Five separate rounded cards would have said "five
   features". A sheet says "one document".

   ── REBUILT AGAINST THE ARCHIVE'S OWN RULES, 2026-09-07 ───────────────────
   The first cut read as a sparse table and the user was right. Diffing it
   against `.clause` in prototype2-archive/styles.css found four divergences,
   and all four were mine, not the archive's:

   1. THE FIGURE IS A CHIP, NOT BARE TEXT. `.clause__figure` has
      `padding .625rem 1rem; border: 1px DASHED; background: slate-50; radius;
      white-space: nowrap`. Bare right-aligned text in an empty column is what
      made the rows look like a spreadsheet with the gridlines turned off —
      the number had nothing holding it. The dashed border is the detail that
      makes it read as a margin annotation on a document rather than a cell.
   2. THE THIRD COLUMN IS `auto`, NOT A FIXED 9rem. `9rem 1fr 9rem` reserved a
      fixed slab for "100%" and left most of it empty on every row. `auto`
      sizes to the chip.
   3. IT COLLAPSES AT `md` (768px), NOT `lg`. A three-column clause fits at
      768px; holding it single-column to 1024px wasted the whole tablet range.
   4. THE PROSE IS CAPPED AT 34rem (`.clause p`). Without it the paragraph ran
      the full 1fr and the measure got too long to read comfortably.

   Also restored: the row hover (`rgba(248,250,252,.7)`) and the document head
   as a small uppercase LABEL rather than a display-font title — it is a form
   header, not a section heading, and setting it in Outfit at 17px made it
   compete with the H2 directly above it.

   The archive sets the head, the clause ids and the figures in a mono face.
   This build has no mono and must not gain one (CLAUDE.md gotcha 4: Outfit +
   Inter, Satoshi for the hero H1 alone), so the documentary feel comes from
   uppercase + wide tracking in Inter, which is how every other eyebrow on the
   site is already built.

   ── DS PASS, 2026-09-07 ───────────────────────────────────────────────────
   Two additions on request, both from DESIGN-SYSTEM.md and neither touching
   the document argument above: the sheet moved from card elevation to the L4
   feature-panel ladder rung (§1.3 — it is the page's hero object), and each
   row gained §8.9's ghost numeral behind its id column.

   ⚠ The foot line is HANDOFF §7 P1 and is flagged. See the note over CLAUSES
   in site.ts before touching it. */
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
          /* DS L4 (§1.3): the sheet is the page's hero object, so it carries
             the feature-panel elevation — big radius, hairline ring, one deep
             soft shadow — instead of a card's shadow-sm. */
          /* Full container width (user, 2026-09-08) — the 56rem cap left the
             sheet floating in a 7xl section. The prose measure below still
             caps itself, so the width goes to breathing room, not line
             length. */
          className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_30px_80px_-15px_rgba(0,0,0,0.1)] ring-1 ring-foreground/5"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border bg-secondary px-6 py-6 sm:px-8 md:px-12">
            <h3 className="text-[13px] font-bold uppercase tracking-[0.14em] text-foreground">
              Working agreement &mdash; summary of terms
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
                {/* DS §8.9's ghost numeral, sitting BEHIND the id labels —
                    near-invisible at rest, warming toward the accent on row
                    hover. Decorative: the readable "Clause NN" follows. */}
                <span
                  className="pointer-events-none absolute -top-7 -left-1 select-none font-display text-[72px] font-bold leading-none text-foreground/5 transition-colors duration-500 group-hover:text-accent/10"
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
                {/* The archive caps `.clause p` at 34rem; the full-width sheet
                    loosens that to 2xl — still a readable measure, without a
                    hard cliff of empty column at 7xl. */}
                <p className="max-w-2xl leading-[1.7] text-muted-foreground">
                  {c.body}
                </p>
              </div>

              {/* aria-hidden: the figure restates the prose beside it, so a
                  screen reader would hear "48 hrs to a written price" twice.
                  The DASHED border is the archive's, and it is what makes this
                  read as an annotation in the document's margin. */}
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
              &mdash; these clauses are carried into every engagement agreement.
            </span>
            <span>India-based &middot; US &amp; UK overlap hours</span>
          </div>
        </div>
      </div>
    </section>
  );
}
