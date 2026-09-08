"use client";

import Icon from "../Icon";
import SectionHeading from "../SectionHeading";
import { useServiceMode } from "./ModeContext";
import { SERVICE_PRINCIPLES } from "@/content/service";

/* ==========================================================================
   HOW WE APPROACH IT — five principles, as an editorial ledger.
   ==========================================================================
   NOT the four engagement steps from home's Process section. That section is
   the calendar (consult → proposal → build → handover); this one is the
   method, and restating the calendar here would spend a whole section on
   something a visitor has already read one page earlier.

   ── THE ARCHETYPE ────────────────────────────────────────────────────────
   Five columns divided by hairlines rather than five cards. The page has
   already spent its card budget (hero switch, capability panel, engagement
   panel) and DS §18.3 is explicit that no two adjacent sections should share
   a layout — this is the only even-column section on the page, and it carries
   no card chrome at all: ghost numeral, icon, title, body, and one line that
   changes with the mode.

   ── WHAT THE MODE CHANGES ────────────────────────────────────────────────
   The last line of each principle. The principle itself is constant — it is
   how we work either way — but what it MEANS for you differs depending on
   whether we are building the thing or joining your team, and that difference
   is the most useful sentence in the section. Only the text swaps; the
   element and its className are stable, so the reveal survives (see
   ModeContext.tsx).
   ========================================================================== */
export default function ApproachPrinciples() {
  const { mode, detail } = useServiceMode();

  return (
    <section
      id="approach"
      className="relative overflow-hidden border-t border-border bg-background py-32"
    >
      <div
        className="pointer-events-none absolute bottom-0 right-0 size-[520px] translate-x-1/3 translate-y-1/3 rounded-full bg-brand/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative z-10 shell">
        <SectionHeading
          eyebrow="How we work"
          icon="repeat"
          accent="that survives the second month."
          lead="Method, not ceremony. These five hold whether we are building your product or sitting inside your team — the last line of each says what it means for you."
          className="max-w-3xl"
        >
          The way of working
        </SectionHeading>

        <ol className="grid gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-y-0">
          {SERVICE_PRINCIPLES.map((p, i) => (
            <li
              key={p.n}
              data-reveal
              style={{ "--delay": `${i * 90}ms` } as React.CSSProperties}
              /* The hairline is a LEFT border with padding, not a divide-x on
                 the parent: at 2 and 3 columns the wrap points differ, and
                 divide-x would draw a line down the left edge of the first
                 item in every row. `first:border-l-0` handles the one case
                 where the border would sit at the very start of the row. */
              /* `flex flex-col` + `mt-auto` on the mode line below: the five
                 bodies are different lengths, and without it each column's
                 divider and mode note sit at its own height — five ragged
                 rules across the section. Pinning them to the bottom is what
                 makes this read as a table rather than five loose columns. */
              className="relative flex flex-col border-border pl-0 sm:border-l sm:pl-7 sm:first:border-l-0 sm:first:pl-0 lg:[&:nth-child(4)]:border-l-0 lg:[&:nth-child(4)]:pl-0 xl:[&:nth-child(4)]:border-l xl:[&:nth-child(4)]:pl-7"
            >
              {/* The ghost numeral (DS §8.9) — decoration, so hidden from AT;
                  the <ol> already conveys the sequence. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-6 right-2 select-none font-display text-[64px] font-bold leading-none text-foreground/[.045] xl:right-0"
              >
                {p.n}
              </span>

              <span className="relative grid size-11 place-items-center rounded-2xl bg-brand/10 text-brand ring-1 ring-brand/15">
                <Icon name={p.icon} className="size-5" />
              </span>

              <h3 className="relative mt-5 font-display text-lg font-bold leading-[1.3] tracking-[-0.02em] text-foreground">
                {p.title}
              </h3>
              <p className="relative mt-3 text-[14px] leading-[1.75] text-muted-foreground">
                {p.body}
              </p>

              {/* The mode-specific consequence. `aria-live` is wrong here —
                  five simultaneous live regions would announce a wall of text
                  on every switch; the switch's own tabpanel further down
                  carries that duty. The label names the mode so the sentence
                  still makes sense read on its own. */}
              <p className="relative mt-auto border-t border-hairline pt-4 text-[14px] leading-[1.65] text-muted-strong xl:mt-8">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-accent-strong">
                  {detail.label}
                </span>
                {mode === "build" ? p.build : p.extend}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
