import Icon from "../Icon";
import SectionHeading from "../SectionHeading";
import { HUE } from "@/content/site";
import { SHAPE } from "@/content/about";

/* "How the company is built" — five absences.

   Every entry is a thing this firm does NOT have: no bench, no account
   manager, no juniors, no sales team, no lock-in. That is deliberate and it
   is the section's whole argument — an absence is checkable on the first call
   in a way that "we value communication" never is, and the org chart is the
   one subject /why-choose-us (the contract) and /services (the work) both
   leave alone.

   ── FIVE, AND THE GRID IS 6-COLUMN FOR IT ────────────────────────────────
   Five does not divide into two or three columns without leaving a hole. On a
   12-column grid at `lg`, three cards of 4 then two of 6 fills both rows
   exactly — 4+4+4 / 6+6 — and the second row's wider cards read as the
   conclusion rather than as leftovers. Changing the count changes this
   arithmetic; six would be plain thirds, four would be halves.

   HOVER SIGNATURE — the tile FILLS. At rest it is the hue at 10% with the
   glyph in that hue; on hover it goes solid with the glyph in white, which is
   the strongest colour-only state available and reads as the item switching
   on. Distinct from the other sections' signatures by design (see Roles.tsx's
   hover banner for the full set). Nothing moves — the site-wide rule from
   WorkCard.tsx: a hover-triggered translate on the hovered element moves its
   own hit box out from under the pointer and oscillates at frame rate. */
export default function Shape() {
  return (
    <section
      id="shape"
      className="relative overflow-hidden border-t border-border bg-secondary py-28"
    >
      <div
        className="pointer-events-none absolute left-0 top-0 size-[480px] -translate-x-1/3 -translate-y-1/4 rounded-full bg-accent/10 blur-[120px]"
        aria-hidden="true"
      />
      <div className="relative z-10 shell">
        <SectionHeading
          eyebrow="How we are built"
          icon="layers"
          accent="is the interesting part."
          lead="What a company does not have shapes your experience of it more than anything it puts on a values page — and unlike a value, an absence is something you can check on the first call."
        >
          What we do not have
        </SectionHeading>

        <ul className="grid gap-6 lg:grid-cols-12">
          {SHAPE.map((s, i) => {
            const h = HUE[s.hue];
            /* 4/4/4 then 6/6 — see the banner. Derived from the index rather
               than stored per item, so the arithmetic lives in one place. */
            const span = i < 3 ? "lg:col-span-4" : "lg:col-span-6";
            return (
              <li
                key={s.title}
                data-reveal
                style={{ "--delay": `${i * 80}ms` } as React.CSSProperties}
                className={`h-full ${span}`}
              >
                <div
                  className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border bg-card p-8 shadow-sm transition-[border-color,box-shadow] duration-300 ease-out hover:border-accent/40 hover:shadow-lg"
                  {...(s.ph ? { "data-placeholder": s.ph } : {})}
                >
                  {/* Whole class strings out of HUE, including the hover.
                      The first draft of this line derived the fill with
                      `h.tile.replace("bg-", "group-hover:bg-")` — a class
                      built at RUNTIME, which the compiled build's scanner
                      cannot see, so the tile would never have filled and
                      nothing would have errored. `solidHover` was added to
                      HUE for exactly this. CLAUDE.md gotcha 1, and it is worth
                      re-reading every time this file grows a variant. */}
                  <span
                    className={`mb-6 grid size-12 place-items-center rounded-2xl ring-1 transition-[background-color,color,box-shadow] duration-300 ease-out group-hover:text-white ${h.soft} ${h.ring} ${h.text} ${h.solidHover}`}
                  >
                    <Icon name={s.k} className="size-6" />
                  </span>
                  <h3 className="mb-3 font-display text-xl font-bold leading-[1.35] tracking-[-0.02em] text-foreground">
                    {s.title}
                  </h3>
                  <p className="text-[15px] leading-[1.7] text-muted-strong">
                    {s.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
