import Icon from "./Icon";
import SectionHeading from "./SectionHeading";
import { FIT_NO, FIT_NOTES, FIT_TITLES, FIT_YES } from "@/content/site";

/* "Read this before you apply" — the two honest lists.

   This is the page's version of the commitment the home page makes to clients:
   "we tell you when to walk away". Turning it on candidates is the reason
   /careers does not need a values section — a list of the people who should
   NOT apply says more about how a place works than any adjective, and it is
   the only claim on a careers page that costs the company something to make.

   A candidate who withdraws here has cost everybody nothing; one who withdraws
   in month three has cost themselves a year and us a training place. That is
   why the section sits BEFORE the FAQ rather than after it.

   ── REBUILT AGAINST DESIGN-SYSTEM.md, 2026-09-08 ─────────────────────────
   The previous pass merged the two lists into one panel with a hard vertical
   rule down the middle. It fixed the height hole it was aimed at and broke
   four of DS §1.2's eight rules doing it — the user's "not attractive at all"
   was precise, not vague:

     rule 2  "Depth via blur, not lines. Hard dividers are rare." A full-height
             1px rule between two flat halves is the most literal violation
             available. Separation here is now elevation and ground: two
             floating cards, each with its own corner aura.
     rule 5  "Colour is functional." The panel was grey on grey. Hue names a
             CATEGORY, and there are exactly two here — so the invitation is
             teal and the warning is amber, on every icon tile in its column.
     rule 7  "Hover always lifts." The merged panel had no hover state at all.
             Both cards lift now, like every other card on the site.
     L2/L3   The elevation ladder has no rung for "one flat box with a rule in
             it". Two `bg-card` cards with `shadow-sm → shadow-lg` is L2, which
             is what the rest of this page uses.

   ── AND THE HEIGHT PROBLEM IS SOLVED PROPERLY THIS TIME ──────────────────
   The merge existed because the YES list is five short lines and the NO list
   is four long ones — as plain text rows that is a ~3-line difference, and
   `h-full` left ~200px of white under the shorter card.

   Giving every line its own ICON TILE changes the arithmetic rather than
   hiding it: a row is now ~52px whatever its text does, so five short rows and
   four tall ones land within a few pixels of each other. No magic number, no
   shared box, and it survives a copy edit — which the merged panel did not.

   The tiles are also the answer to "give it real icons": a repeated tick down
   a column says "list", where a glyph per line says what the line is about.
   Which glyph is in site.ts with the copy; only the colour is decided here. */

/* One hue per column, whole class strings — never composed at runtime
   (CLAUDE.md gotcha 1: a concatenated class is silently dropped by the
   compiled build). Teal is already this project's "good" hue; amber is from
   DS §2.3's accent spectrum and is the one warm option in it, which is what a
   caution wants — a red would read as rejection, and none of these lines is
   a rejection. */
const COLUMNS = [
  {
    key: "yes",
    title: FIT_TITLES.yes,
    /* NOT a tick. A tick on the header tile is the same glyph the list rows
       used to carry, so it read as "list of correct things" rather than as
       what this column is — the two of us agreeing to work together. It also
       collided with the tick's other job on this site, which is confirming a
       commitment (CtaAnchor's meta row, the FAQ). */
    icon: "handshake",
    items: FIT_YES,
    note: FIT_NOTES.yes,
    tile: "bg-teal-600/10 text-teal-600 ring-teal-600/15",
    tileOn: "group-hover:bg-teal-600 group-hover:text-white group-hover:ring-teal-600/30",
    glow: "bg-teal-600/10",
    head: "bg-teal-600/10 text-teal-600 ring-teal-600/15",
  },
  {
    key: "no",
    title: FIT_TITLES.no,
    /* A fork in the road, not a cross. None of these lines is a rejection —
       they describe a different job — and a cross would say otherwise. */
    icon: "split",
    items: FIT_NO,
    note: FIT_NOTES.no,
    tile: "bg-amber-500/10 text-amber-600 ring-amber-500/15",
    tileOn: "group-hover:bg-amber-500 group-hover:text-white group-hover:ring-amber-500/30",
    glow: "bg-amber-500/10",
    head: "bg-amber-500/10 text-amber-600 ring-amber-500/15",
  },
] as const;

export default function FitCheck() {
  return (
    <section
      id="fit"
      className="relative overflow-hidden border-t border-border bg-secondary py-28"
    >
      {/* DS §2.5: 1–3 ambient orbs per section, pushed half off the edge. */}
      <div
        className="pointer-events-none absolute left-0 top-0 size-[480px] -translate-x-1/3 -translate-y-1/4 rounded-full bg-teal-600/10 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 size-[420px] translate-x-1/3 translate-y-1/4 rounded-full bg-amber-500/10 blur-[120px]"
        aria-hidden="true"
      />
      <div className="relative z-10 shell">
        <SectionHeading
          eyebrow="Before you apply"
          /* Was `split`, the same glyph as the right-hand card's tile — two
             forks in one section read as a repeated icon rather than as a
             badge and a category. */
          icon="shield"
          accent="talk you out of it."
          lead="We tell clients on the first call when they should hire somebody else. It would be strange to be less honest with somebody about to give us two years."
          className="max-w-2xl"
        >
          The part where we try to
        </SectionHeading>

        <div className="grid gap-6 lg:grid-cols-2">
          {COLUMNS.map((c, ci) => (
            /* Wrapper reveals, card carries the hover classes — the split
               Faq.tsx documents. Nothing here is stateful, but the next hover
               added to this card would hit the same collision. */
            <div
              key={c.key}
              data-reveal
              style={{ "--delay": `${ci * 120}ms` } as React.CSSProperties}
              className="h-full"
            >
              <div className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border bg-card p-8 shadow-sm transition-[border-color,box-shadow] duration-300 ease-out hover:border-accent/40 hover:shadow-lg sm:p-10">
                <div
                  className={`pointer-events-none absolute -right-20 -top-20 size-48 rounded-full opacity-0 blur-[70px] transition-opacity duration-500 group-hover:opacity-100 ${c.glow}`}
                  aria-hidden="true"
                />

                <div className="relative mb-7 flex items-center gap-3">
                  <span
                    className={`grid size-11 shrink-0 place-items-center rounded-2xl ring-1 ${c.head}`}
                  >
                    <Icon name={c.icon} className="size-5" />
                  </span>
                  <h3 className="font-display text-xl font-bold leading-[1.35] tracking-[-0.02em] text-foreground">
                    {c.title}
                  </h3>
                </div>

                <ul
                  className="relative space-y-3"
                  {...(c.key === "no"
                    ? {
                        "data-placeholder":
                          "P1: these restate the terms — keep in step with TERMS",
                      }
                    : {})}
                >
                  {c.items.map((f, i) => (
                    <li key={f.t} className="flex items-start gap-3.5">
                      {/* The tile is `mt-px`, not `mt-0`: a 36px square next
                          to a 15px/1.7 line optically sits high without it,
                          because the glyph's mass is centred and the text's
                          is on its baseline. */}
                      {/* SIGNATURE — the tiles FILL IN SEQUENCE. A 60ms step
                          per row makes the column read itself top to bottom
                          rather than flashing as one block, which is exactly
                          what this section wants a reader to do: go down the
                          list.

                          The delay is an inline style because it is per-index,
                          and a Tailwind class cannot be built from `i` — a
                          concatenated `delay-${i * 60}` is invisible to the
                          compiled build's scanner and would be silently
                          dropped (CLAUDE.md gotcha 1). It applies on the way
                          out too, so the column empties in the same order. */}
                      <span
                        style={{ transitionDelay: `${i * 60}ms` }}
                        className={`mt-px grid size-9 shrink-0 place-items-center rounded-xl ring-1 transition-[background-color,color,box-shadow] duration-300 ease-out ${c.tile} ${c.tileOn}`}
                        aria-hidden="true"
                      >
                        <Icon name={f.k} className="size-[18px]" />
                      </span>
                      <span className="text-[15px] leading-[1.7] text-muted-strong">
                        {f.t}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* mt-auto pins the note to the bottom, so whichever column
                    still ends a little short grows its gap instead of leaving
                    the note floating mid-card. */}
                <p className="relative mt-auto pt-8 text-[13px] leading-[1.7] text-muted-foreground">
                  {c.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
