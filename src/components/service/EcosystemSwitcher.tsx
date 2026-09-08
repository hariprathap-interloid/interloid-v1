"use client";

import { useRef, useState } from "react";
import EcosystemSection, {
  type EcosystemLayout,
  type EcosystemVariant,
} from "./EcosystemSection";

/* ==========================================================================
   THE DESIGN SWITCHER — every ecosystem layout in one place.
   ==========================================================================
   Replaces the shape the preview pages had, which was to stack every variant
   down one page: eight tall diagrams meant eight sets of node ids, eight live
   IntersectionObservers and eight animating SVGs on screen at once, and a
   comparison that could only be made by scrolling between them from memory.
   One at a time, swapped in place, compares far better — the diagram lands in
   the SAME position every time, so the difference between two layouts is the
   only thing that moves.

   ── THE REVEAL TRAP, AND WHY THIS IS SAFE ───────────────────────────────
   Reveal.tsx observes every [data-reveal] ONCE on mount and unobserves on the
   first hit, so an element that appears later is never observed and stays
   invisible for good. The [data-reveal] wrapper lives inside EcosystemSection
   and only its CHILD changes when the variant does — same element, same
   position, same type — so React keeps the DOM node and its `is-in` class
   with it. Never give the EcosystemSection a `key` that varies with the
   variant: that remounts the wrapper, it is never re-observed, and the whole
   diagram disappears. `.switcher.mjs` asserts the lines stay drawn after a
   switch precisely so that mistake cannot land quietly.

   Level-2 shape is a separate control from the layout because that is what it
   is: `.eco-circles` restyles the group node of all eight layouts from one
   wrapper class. Presenting sixteen names would imply sixteen designs.
   ========================================================================== */

export type EcosystemDesign = {
  layout: EcosystemLayout;
  name: string;
  best: string;
  cost: string;
  /** A KNOWN defect. Stated, never hidden — a design cannot be chosen well
      against a description that leaves out the thing that is wrong with it. */
  caveat?: string;
};

/* ── ONE RADIO GROUP ───────────────────────────────────────────────────────
   ROVING TABINDEX, which is the whole reason this is not eight buttons. A
   radiogroup is ONE tab stop: tab moves past the set, arrows move within it.
   Eight separate stops would put the diagram nine tabs below the heading and
   would also be wrong — these are one choice, not eight actions. */
function Choice<T extends string>({
  label,
  options,
  value,
  onChange,
  name,
}: {
  label: string;
  options: { v: T; name: string }[];
  value: T;
  onChange: (v: T) => void;
  name: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const go = (i: number) => {
    const j = (i + options.length) % options.length;
    onChange(options[j].v);
    refs.current[j]?.focus();
  };

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <span
        id={`${name}-label`}
        className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground"
      >
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={`${name}-label`}
        className="flex flex-wrap gap-2"
      >
        {options.map((o, i) => {
          const on = o.v === value;
          return (
            <button
              key={o.v}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              data-choice={o.v}
              onClick={() => onChange(o.v)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                  e.preventDefault();
                  go(i + 1);
                } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                  e.preventDefault();
                  go(i - 1);
                } else if (e.key === "Home") {
                  e.preventDefault();
                  go(0);
                } else if (e.key === "End") {
                  e.preventDefault();
                  go(options.length - 1);
                }
              }}
              /* Whole strings on both arms — a class built by concatenation is
                 dropped silently by a compiled build (HANDOFF §5.1). */
              className={
                on
                  ? "rounded-full border border-accent bg-accent/10 px-4 py-2 text-[13px] font-semibold text-accent-strong transition-colors"
                  : "rounded-full border border-border bg-card px-4 py-2 text-[13px] font-semibold text-muted-strong transition-colors hover:border-accent/40 hover:text-foreground"
              }
            >
              {o.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function EcosystemSwitcher({
  designs,
}: {
  designs: EcosystemDesign[];
}) {
  const [layout, setLayout] = useState<EcosystemLayout>(designs[0].layout);
  const [shape, setShape] = useState<"pill" | "circle">("circle");
  /* A CONTROL, not a per-design constant. It was the latter for one pass and
     that was wrong: whether a design is better with the flow or without it is
     exactly the question this page exists to answer, so it cannot be decided
     in the catalogue on the design's behalf. It survives a design change on
     purpose — comparing two layouts is only fair if the beads are the same on
     both. */
  const [dots, setDots] = useState<"with" | "without">("with");

  /* NOT the concatenation gotcha: this builds a VARIANT KEY, not a class
     name. `EcosystemVariant` is a template-literal type, so the compiler
     checks the result against the eight layouts rather than trusting it. */
  const variant = (
    shape === "circle" ? `${layout}-circle` : layout
  ) as EcosystemVariant;

  const design = designs.find((d) => d.layout === layout) ?? designs[0];

  return (
    /* ONE scroll region holding both, so the control can stay pinned while a
       900px diagram scrolls past it. A sticky element only sticks for as long
       as its PARENT is in view — in its own wrapper it would unpin
       immediately. Nothing here may take a non-visible `overflow` either:
       that makes an ancestor a scroll container and kills sticky outright
       (TAILWIND-MAP §4c). */
    <div>
      <div className="sticky top-24 z-30 border-y border-border bg-card/95 py-4 backdrop-blur-md">
        <div className="shell flex flex-col gap-3">
          <Choice
            name="layout"
            label="Design"
            value={layout}
            onChange={setLayout}
            options={designs.map((d) => ({ v: d.layout, name: d.name }))}
          />
          {/* The two small controls share a row. The bar is sticky over the
              diagram it drives, so every row it costs is a strip of stage a
              reader cannot hover — measured as an intercepted pointer event
              on the top service node. */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <Choice
              name="shape"
              label="Level 2"
              value={shape}
              onChange={setShape}
              options={[
                { v: "circle" as const, name: "Circle" },
                { v: "pill" as const, name: "Pill" },
              ]}
            />
            <Choice
              name="dots"
              label="Flow"
              value={dots}
              onChange={setDots}
              options={[
                { v: "with" as const, name: "With dots" },
                { v: "without" as const, name: "Without dots" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="shell pt-12">
        <div className="flex flex-col gap-2 border-l-2 border-accent/40 pl-5">
          <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-foreground">
            {design.name}
          </h2>
          <p className="max-w-3xl text-[15px] leading-[1.7] text-muted-strong">
            <span className="font-semibold text-foreground">Good at — </span>
            {design.best}
          </p>
          <p className="max-w-3xl text-[15px] leading-[1.7] text-muted-foreground">
            <span className="font-semibold text-foreground">Costs — </span>
            {design.cost}
          </p>
          {design.caveat && (
            <p className="mt-1 max-w-3xl rounded-xl border border-border bg-secondary px-4 py-3 text-[14px] leading-[1.7] text-muted-strong">
              <span className="font-semibold text-foreground">
                Known defect —{" "}
              </span>
              {design.caveat}
            </p>
          )}
          {/* The literal one-line change, so the choice stays concrete. */}
          <p className="mt-1 font-mono text-[12px] text-muted-foreground">
            &lt;EcosystemSection variant=&quot;{variant}&quot; /&gt;
          </p>
        </div>
      </div>

      {/* NO `key` here. See the reveal trap in the banner. `idPrefix` follows
          the variant so node ids change with it, which is what lets a harness
          address the rendered diagram without knowing what it swapped from. */}
      <EcosystemSection
        variant={variant}
        idPrefix={variant}
        heading={false}
        id={`preview-${variant}`}
        flow={dots === "with"}
      />
    </div>
  );
}
