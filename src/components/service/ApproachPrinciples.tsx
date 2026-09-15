"use client";

import Icon from "../Icon";
import SectionHeading from "../SectionHeading";
import { useServiceMode } from "./ModeContext";
import { SERVICE_PRINCIPLES } from "@/content/service";

/* Five working principles as an editorial ledger: columns divided by
   hairlines rather than cards. The method, not the engagement calendar.

   The mode changes only the last line of each principle. Only the text swaps;
   the element and its className stay stable so the reveal state survives
   (see ModeContext.tsx). */
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
          lead="Method, not ceremony. These five hold whether we are building your product or sitting inside your team; the last line of each says what it means for you."
          className="max-w-3xl"
        >
          The way of working
        </SectionHeading>

        {/* `gap-x-7` matches the `pl-7` on every bordered item, so the
            hairline sits 28px from the text on both sides. */}
        <ol className="grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-y-0">
          {SERVICE_PRINCIPLES.map((p, i) => (
            <li
              key={p.n}
              data-reveal
              style={{ "--delay": `${i * 90}ms` } as React.CSSProperties}
              /* The hairline is a LEFT border with padding, not a divide-x on
                 the parent: at 2 and 3 columns the wrap points differ, and
                 divide-x would draw a line down the left edge of the first
                 item in every row.

                 An item that starts a row carries neither the rule nor the
                 inset, and which items start rows changes per breakpoint:

                   cols   row-starts   bordered
                   1      1,2,3,4,5    –
                   2      1,3,5        2,4
                   3      1,4          2,3,5
                   5      1            2,3,4,5

                 The classes are written as change points — each child index
                 appears at most once per breakpoint — because Tailwind cannot
                 order `border-l` against `border-l-0` within one variant
                 bucket. Item 1 is never bordered. */
              /* `flex flex-col` + `mt-auto` on the mode line pins every
                 column's divider to the same baseline despite uneven bodies. */
              className="relative flex flex-col border-border pl-0 sm:nth-2:border-l sm:nth-2:pl-7 sm:nth-4:border-l sm:nth-4:pl-7 lg:nth-3:border-l lg:nth-3:pl-7 lg:nth-4:border-l-0 lg:nth-4:pl-0 lg:nth-5:border-l lg:nth-5:pl-7 xl:nth-4:border-l xl:nth-4:pl-7"
            >
              {/* Ghost numeral — decorative; the <ol> conveys the sequence. */}
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

              {/* Mode-specific line. No `aria-live`: five live regions would
                  announce a wall of text on every switch. The label names the
                  mode so the sentence reads on its own. */}
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
