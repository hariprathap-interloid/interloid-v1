import SectionHeading from "./SectionHeading";
import { WEEK } from "@/content/site";

/* "A normal week, working with us" — a timeline: a rail through five day
   nodes, horizontal at lg, vertical below.

   The rail is drawn as PER-ITEM SEGMENTS (each li except the last carries the
   line to its neighbour), not one absolutely-positioned run: card heights
   differ, and a single rail sized to the container either overshoots the last
   dot or has to guess the first card's height. Segment geometry that must
   agree: dot size-4 (centre 8px) ⇄ vertical segment left-[7px] w-0.5 ⇄
   horizontal segment top-[7px] h-0.5; the vertical segment's -bottom-10 is
   the ol's gap-y-10, and the horizontal segment's -right-6 is lg:gap-x-6.

   Five columns at lg so the sequence never wraps. The `hi` day is the
   destination node — filled, glowing, its card ringed.

   Hover is colour + elevation only, no lift: hover-triggered geometry on the
   hovered element flickers at its own edge. */
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
