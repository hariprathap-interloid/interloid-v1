import Icon from "./Icon";
import SectionHeading from "./SectionHeading";
import { PROGRAMME, PROGRAMME_META } from "@/content/site";

/* ==========================================================================
   THE PROGRAMME — the two years, in order.

   Replaces THREE sections from the 2026-09-07 page (the six commitment tiles,
   the grouped stack grid, and "your first 90 days"), which is most of how the
   page got shorter. For a senior hire the interesting question was what the
   company promises; for somebody signing a two-year agreement out of college
   it is what the two years actually contain, in sequence — so a timeline says
   more here than nine tiles did.

   ── REFACTORED 2026-09-08 ────────────────────────────────────────────────
   The first cut centred everything and hung a hairline rail behind it. Three
   things were wrong and the user pointed at all of them at once:

     1. CENTRED BODY COPY. Four and five line paragraphs, ragged on both
        edges, in three tall cards. Centred text is for a line or two; at this
        length it is measurably harder to read and it left the cards looking
        empty at the shoulders. Everything is left-aligned now.

     2. THE RAIL WAS INVISIBLE. `h-px` at `via-accent/40` between two /10
        stops — at 1440 that is a one-pixel line at roughly 40% alpha for a
        third of its length. It carried the whole "this is a sequence"
        message and could not be seen. It is now `h-0.5`, opaque at the
        middle, and it runs between numbered nodes rather than behind
        decorative icons.

     3. NOTHING SAID *ORDER*. Three identical cards with three different
        icons read as three parallel things. The nodes are NUMBERED now, and
        phase one — the hard one — carries the accent the way WeekStrip marks
        Friday, so the row has a shape instead of three equal beats.

   ── THE RAIL'S GEOMETRY IS DERIVED, NOT EYEBALLED ────────────────────────
   It has now been wrong twice from guessing, so the arithmetic is written
   out. Nodes are LEFT-aligned inside each card (they were centred before, and
   the insets are different):

     x-start  1px card border + 2rem of p-8 + half of a size-14 node
              = 1 + 32 + 28 = 61px from the grid's left edge.
     x-end    the last node sits 61px into the LAST column, so the right
              inset is one column minus 61px. A column in a 3-up grid with a
              1.5rem gap is (100% - 3rem)/3.
     y        the same 61px, measured down.

   `hidden lg:block`: stacked, the cards are already adjacent and a rail
   through them would cross their text (HANDOFF §5.7 in miniature).

   THE HARD PART IS FIRST, ON PURPOSE. Twelve-hour days are the single fact
   most likely to make somebody withdraw, and the cheapest place for them to
   do that is here rather than in month two. Every phase carries its own
   data-placeholder because none of these terms is confirmed — see site.ts's
   TERMS banner, and the note there about the working-hours exposure. */

/* The little glyph beside each phase note. Presentation, so it stays here —
   unlike the note itself, which is copy and lives in site.ts. Same reasoning
   for the accent: phase one is highlighted by INDEX, not by a flag in the
   content, because it is a decision about the first item. Reorder PROGRAMME
   and the accent moves with the position rather than stranding on a phase that
   is no longer first. */
const NODE_ICON = ["zap", "code", "user-check"];

export default function Programme() {
  return (
    <section
      id="programme"
      className="relative overflow-hidden border-t border-border bg-background py-28"
    >
      <div
        className="pointer-events-none absolute bottom-0 left-1/4 size-[460px] translate-y-1/3 rounded-full bg-brand/10 blur-[120px]"
        aria-hidden="true"
      />
      <div className="relative z-10 shell">
        <SectionHeading
          eyebrow="The programme"
          icon="rocket"
          accent="written down before you start."
          lead="Six months of training, then real client work, on a two-year agreement. Here is the whole of it — including the part that will put some people off."
        >
          Two years,
        </SectionHeading>

        <div className="relative">
          <div
            className="pointer-events-none absolute left-[61px] right-[calc((100%-3rem)/3-61px)] top-[61px] hidden h-0.5 rounded-full bg-gradient-to-r from-accent/50 via-accent/40 to-brand/20 lg:block"
            aria-hidden="true"
          />

          <ol className="relative z-10 grid gap-6 lg:grid-cols-3">
            {PROGRAMME.map((p, i) => {
              const lead = i === 0;
              return (
                <li
                  key={p.tag}
                  data-reveal
                  style={{ "--delay": `${i * 120}ms` } as React.CSSProperties}
                  className="h-full"
                >
                  <div
                    className={`group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border bg-card p-8 shadow-sm transition-[border-color,box-shadow] duration-300 ease-out hover:shadow-lg ${
                      lead
                        ? "border-accent/40 ring-1 ring-accent/10"
                        : "border-border hover:border-accent/40"
                    }`}
                    {...(p.ph ? { "data-placeholder": p.ph } : {})}
                  >
                    {/* The node and the phase chip share a row, so the rail
                        passes through the node and the label sits beside it
                        rather than under it — which is what makes the row read
                        left-to-right instead of as three stacked cards.

                        `border-4 border-card` punches the rail out from behind
                        the node; the same trick Process uses on its 80px one. */}
                    <div className="mb-5 flex items-center gap-4">
                      <span
                        /* SIGNATURE — the node ignites. This section is a
                           timeline, so the node is the thing that should
                           answer the cursor: it fills, and a ring blooms
                           around it. `ring-0 → ring-8` is a box-shadow, so it
                           paints OVER the rail and the neighbouring card
                           without displacing either.

                           `transition-[background-color,color,box-shadow]`,
                           not `transition-colors`: the ring is a shadow, and
                           `colors` does not cover it — it would snap on while
                           the fill eased. */
                        className={`grid size-14 shrink-0 place-items-center rounded-full border-4 border-card font-display text-[15px] font-bold ring-0 ring-accent/15 transition-[background-color,color,box-shadow] duration-300 ease-out group-hover:ring-8 ${
                          lead
                            ? "bg-accent text-white"
                            : "bg-accent/10 text-accent-strong group-hover:bg-accent group-hover:text-white"
                        }`}
                        aria-hidden="true"
                      >
                        {/* The numeral IS the node — an icon here would say
                            "category" where the whole section says "order".
                            aria-hidden because the <ol> already numbers these
                            for a screen reader. */}
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex flex-col gap-1.5">
                        <span
                          className={`w-fit rounded-full px-2.5 py-[3px] text-[11px] font-bold uppercase tracking-[0.08em] ring-1 transition-[background-color,color,box-shadow] duration-300 ${
                            lead
                              ? "bg-accent/10 text-accent-strong ring-accent/25"
                              : "bg-background text-muted-foreground ring-border group-hover:bg-accent/10 group-hover:text-accent-strong group-hover:ring-accent/25"
                          }`}
                        >
                          {p.tag}
                        </span>
                        <span className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
                          <Icon
                            name={NODE_ICON[i] ?? "layers"}
                            className="size-3.5 text-accent-strong"
                          />
                          {p.note}
                        </span>
                      </span>
                    </div>

                    <h3 className="mb-3 font-display text-xl font-bold leading-[1.35] tracking-[-0.02em] text-foreground">
                      {p.title}
                    </h3>
                    <p className="text-[15px] leading-[1.7] text-muted-strong">
                      {p.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* ── THE SUMMARY ROW (rebuilt 2026-09-08) ─────────────────
            It was four ticked sentences on a `bg-secondary` bar with `mt-8`,
            and the user read it as a separate component that had drifted into
            the section. Both halves of that were true:

              GROUND. Every other object in this section is `bg-card` on a
              `bg-background` section. The strip was the only `bg-secondary`
              thing on the page outside a section ground, so it did not belong
              to the card group visually. It now takes the cards' exact
              surface — same border, same radius, same shadow — and `mt-6`,
              the grid's own gap, so it reads as the last row of the group
              rather than an object sitting under it.

              SCANNING. A tick plus a sentence is a list: the eye has to read
              all four to find the number it wants. Figure-over-label is read
              in one pass, which is the entire job of a summary. It also stops
              the strip competing with the hero band, which states the same
              four facts as icon + label + body — context up there, recall
              down here.

            DIVIDERS, and `divide-x` is safe here for the reason it was NOT in
            the hero: this is a 1-D flex that goes column → row, so the rule is
            always between neighbours. On a wrapping grid it would draw down
            the left of a cell sitting in column one. */}
        <div
          data-reveal
          style={{ "--delay": "400ms" } as React.CSSProperties}
          className="mt-6"
        >
          <dl className="flex flex-col divide-y divide-border overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-sm sm:flex-row sm:divide-x sm:divide-y-0">
            {PROGRAMME_META.map((m) => (
              <div
                key={m.figure + m.label}
                className="flex-1 px-6 py-6 text-center"
                {...(m.ph ? { "data-placeholder": m.ph } : {})}
              >
                {/* <dt> is the FIGURE, <dd> the label. A description list is
                    the right element for figure/caption pairs, and this way
                    round is the one that reads correctly aloud: a screen
                    reader announces the term then its definition — "6 months,
                    of training" — where the reverse announces a caption
                    orphaned from its number. */}
                <dt className="font-display text-[26px] font-bold leading-none tracking-[-0.02em] text-foreground">
                  {m.figure}
                </dt>
                <dd className="mt-2 text-[13px] leading-[1.5] text-muted-foreground">
                  {m.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
