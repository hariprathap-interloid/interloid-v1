import Icon from "./Icon";
import SectionHeading from "./SectionHeading";
import { FIT_NO, FIT_NOTES, FIT_TITLES, FIT_YES } from "@/content/site";

/* "Read this before you apply" — who this suits and who it does not. A
   candidate who withdraws here costs nobody anything, which is why the
   section sits before the FAQ.

   Two separate cards, each list colour-coded by category (teal for yes,
   amber for no).

   ── EQUAL HEIGHTS WITHOUT A MAGIC NUMBER ─────────────────────────────────
   The lists differ in count and line length. Giving every line its own icon
   tile makes each row roughly the same height whatever its text does, so the
   two cards land within a few pixels of each other and stay that way through
   copy edits. Glyphs live in site.ts with the copy; only colour is set here. */

/* One hue per column, as whole class strings: Tailwind only generates
   classes it can see written out in full. Amber rather than red, because
   none of these lines is a rejection. */
const COLUMNS = [
  {
    key: "yes",
    title: FIT_TITLES.yes,
    /* Not a tick: the tick already means "confirmed commitment" elsewhere on
       the site, and this column is about agreeing to work together. */
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
          /* Not `split`: that glyph is already the right-hand card's tile. */
          icon="shield"
          accent="talk you out of it."
          lead="We tell clients on the first call when they should hire somebody else. It would be strange to be less honest with somebody about to give us two years."
          className="max-w-2xl"
        >
          The part where we try to
        </SectionHeading>

        <div className="grid gap-6 lg:grid-cols-2">
          {COLUMNS.map((c, ci) => (
            /* The wrapper reveals and the card carries the hover classes, so
               a future state-driven className on the card cannot wipe
               Reveal's `is-in`. */
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
                          "P1: these restate the terms: keep in step with TERMS",
                      }
                    : {})}
                >
                  {c.items.map((f, i) => (
                    <li key={f.t} className="flex items-start gap-3.5">
                      {/* The tile is `mt-px`, not `mt-0`: a 36px square next
                          to a 15px/1.7 line optically sits high without it,
                          because the glyph's mass is centred and the text's
                          is on its baseline. */}
                      {/* Signature: the tiles fill in sequence, a 60ms step
                          per row, so the column reads top to bottom.

                          The delay is an inline style because it is per-index:
                          a concatenated `delay-${i * 60}` class is invisible
                          to Tailwind's scanner and would never be generated.
                          It applies on the way out too. */}
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
