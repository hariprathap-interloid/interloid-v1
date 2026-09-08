import SectionHeading from "./SectionHeading";
import { WEEK } from "@/content/site";

/* "A normal week, working with us" — prototype2-archive's `.week` / `.day`.

   ── REBUILT AS A TIMELINE, 2026-09-08 ─────────────────────────────────────
   The first cut was five equal floating cards and the user was right that it
   read as filler: nothing in the layout said SEQUENCE, which is the one thing
   the block communicates. This is now the DS §8.9 timeline idea at week
   scale — a rail through five day nodes, horizontal on lg, vertical below it.

   The rail is drawn as PER-ITEM SEGMENTS (each li except the last carries the
   piece of line to its neighbour), not one absolutely-positioned run: card
   heights differ, and a single vertical rail sized to the container either
   overshoots the last dot or has to guess the first card's height. A segment
   from "below my dot" to "the top of the next li" is correct at any height.
   Segment geometry that must agree: dot size-4 (centre 8px) ⇄ vertical
   segment left-[7px] w-0.5 ⇄ horizontal segment top-[7px] h-0.5; the
   vertical segment's -bottom-10 is the ol's gap-y-10.

   Five columns at lg for the same reason as before: Mon → Anytime is a
   sequence and wrapping would put Friday under Monday. Friday (`hi`) is the
   destination node — filled, glowing, its card ringed — because the demo is
   the ceremony the week is built around.

   Hover stays colour + elevation ONLY — no lift. WorkCard's note:
   hover-triggered geometry on the hovered element flickers at its own edge. */
export default function WeekStrip() {
  return (
    <section
      id="week"
      className="relative overflow-hidden border-t border-border bg-secondary py-32"
    >
      <div
        className="pointer-events-none absolute bottom-0 left-0 size-[520px] -translate-x-1/3 translate-y-1/3 rounded-full bg-brand/10 blur-[120px]"
        aria-hidden="true"
      />
      <div className="relative z-10 shell">
        <SectionHeading
          eyebrow="Direct, by default"
          icon="clock"
          accent="working with us."
          lead="No account managers relaying messages, no monthly steering decks. This is what the communication actually looks like."
        >
          A normal week,
        </SectionHeading>

        <ol className="grid gap-y-10 lg:grid-cols-5 lg:gap-x-6 lg:gap-y-0">
          {WEEK.map((d, i) => (
            <li
              key={d.tag}
              data-reveal
              style={{ "--delay": `${i * 80}ms` } as React.CSSProperties}
              className="relative flex gap-5 lg:block"
            >
              {/* Node. ring-secondary matches the section ground so the rail
                  reads as passing BEHIND the dot. */}
              <span
                aria-hidden="true"
                /* `block`, load-bearing: the li is lg:block, and an inline
                   span ignores size-4 — the dot vanishes without it. */
                className={`relative z-10 mt-1 block size-4 shrink-0 rounded-full ring-4 ring-secondary lg:mb-6 lg:mt-0 ${
                  d.hi
                    ? "bg-accent shadow-[0_0_14px_2px] shadow-accent/40"
                    : "border-2 border-accent/40 bg-card"
                }`}
              />

              {/* Rail segments to the NEXT node — skipped on the last item. */}
              {i < WEEK.length - 1 && (
                <>
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-10 left-[7px] top-6 w-0.5 bg-border lg:hidden"
                  />
                  <span
                    aria-hidden="true"
                    className={`absolute -right-6 left-8 top-[7px] hidden h-0.5 lg:block ${
                      /* The segment INTO Friday warms up: the week points at
                         the demo. */
                      WEEK[i + 1].hi
                        ? "bg-gradient-to-r from-border to-accent/60"
                        : "bg-border"
                    }`}
                  />
                </>
              )}

              <div
                className={`flex h-full flex-1 flex-col rounded-[1.5rem] border p-6 transition-[border-color,box-shadow] duration-300 ease-out lg:h-auto ${
                  d.hi
                    ? "border-accent/40 bg-card shadow-md ring-1 ring-accent/15"
                    : "border-border bg-card shadow-sm hover:border-accent/30 hover:shadow-md"
                }`}
              >
                <span
                  className={`mb-3 text-[11px] font-bold uppercase tracking-[0.12em] ${
                    d.hi ? "text-accent-strong" : "text-muted-foreground"
                  }`}
                >
                  {d.tag}
                </span>
                <h3 className="mb-2 font-display text-[17px] font-bold leading-[1.4] tracking-[-0.015em] text-foreground">
                  {d.title}
                </h3>
                <p className="text-[15px] leading-[1.65] text-muted-foreground">
                  {d.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
