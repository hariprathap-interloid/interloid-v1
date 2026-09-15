import Icon from "./Icon";
import SectionHeading from "./SectionHeading";
import { PROGRAMME, PROGRAMME_META } from "@/content/site";

/* ==========================================================================
   THE PROGRAMME — the two years, in order, as a left-aligned timeline of
   numbered nodes joined by a rail. The hardest phase comes first on purpose:
   it is the fact most likely to make somebody withdraw, and the cheapest
   place to do that is here.

   ── THE RAIL'S GEOMETRY IS DERIVED, NOT EYEBALLED ────────────────────────
   Nodes are left-aligned inside each card:

     x-start  1px card border + 2rem of p-8 + half of a size-14 node
              = 1 + 32 + 28 = 61px from the grid's left edge.
     x-end    the last node sits 61px into the last column, so the right
              inset is one column minus 61px. A column in a 3-up grid with a
              1.5rem gap is (100% - 3rem)/3.
     y        the same 61px, measured down.

   `hidden lg:block`: stacked, a rail through the cards would cross their
   text.

   Copy marked data-placeholder is unverified; confirm before public launch. */

/* The glyph beside each phase note. Presentation, so it stays here rather
   than in site.ts. Likewise the accent is chosen by index, not a content
   flag, so reordering PROGRAMME keeps it on whichever phase is first. */
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
          lead="Six months of training, then real client work, on a two-year agreement. Here is the whole of it, including the part that will put some people off."
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
                        passes through the node and the label sits beside it,
                        reading left-to-right.

                        `border-4 border-card` punches the rail out from behind
                        the node. */}
                    <div className="mb-5 flex items-center gap-4">
                      <span
                        /* Signature: the node fills and a ring blooms around
                           it. `ring-0 → ring-8` is a box-shadow, so it paints
                           over the rail and the neighbouring card without
                           displacing either.

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
                        {/* A numeral rather than an icon, because the section
                            is about order. aria-hidden because the <ol>
                            already numbers these for a screen reader. */}
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

        {/* ── THE SUMMARY ROW ───────────────────────────────────────
            Same surface as the cards and `mt-6` (the grid's own gap), so it
            reads as the last row of the group. Figure-over-label scans in one
            pass.

            `divide-x` is safe because this is a 1-D flex that goes column →
            row, so the rule is always between neighbours. On a wrapping grid
            it would draw down the left of a cell sitting in column one. */}
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
                {/* <dt> is the figure, <dd> the label: a screen reader
                    announces the term then its definition ("6 months, of
                    training"), which the reverse order would garble. */}
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
