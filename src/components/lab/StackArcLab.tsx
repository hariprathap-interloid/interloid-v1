"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { AXES, STYLES, type ArcAxis, type ArcStyle } from "./StackArc";

const StackArc = dynamic(() => import("./StackArc"), {
  ssr: false,
  loading: () => (
    <p className="grid h-[420px] place-items-center rounded-[1.25rem] border border-border bg-card text-[12px] text-muted-foreground">
      loading three.js…
    </p>
  ),
});

/* The switcher for /stack-arc. The scene is remounted per treatment (`key`)
   rather than morphed: these are five ways of ANNOTATING one arrangement, and
   interpolating a leader line into a bracket produces a shape that is neither
   and tells you nothing about either. The arc itself is identical in all five,
   which is what makes them comparable. */

const NOTES: Record<ArcStyle, { what: string; cost: string }> = {
  plain: {
    what: "The label and nothing else, centred over its group. The control: everything below is judged against how much clearer it actually is than this.",
    cost: "Association is positional only. With two rows and a staggered label it is not always obvious which marks a label is naming, especially at the ends of the arc where segments get narrow.",
  },
  leader: {
    what: "One line from the label down to the middle of its group. The cheapest possible way to turn a positional association into a stated one.",
    cost: "Points at the group's centre, so with an even number of marks it points at a gap. Reads slightly better with one row than two.",
  },
  spokes: {
    what: "A line from the label to every mark it names. Nothing is left to inference; you can trace any mark back to its group without counting across.",
    cost: "The busiest by far: a service with thirteen marks draws thirteen lines, and at the edges of the arc they converge into a hatch. Best on services with three or four marks a group.",
  },
  bracket: {
    what: "A rule spanning the group's projected width with end ticks, label centred on it. The typographic answer: it reads as a caption for a RANGE rather than a pointer at a thing, which is what a group actually is.",
    cost: "The span is computed from projected positions, so it is exact, but two adjacent brackets can end up nearly touching when one group is much wider than its neighbour.",
  },
  named: {
    what: "Every mark carries its own name underneath, plus the group label above. The only treatment that answers “what is that mark?” with no interaction at all, which matters, because tapping a 44px plate is the weakest part of this whole idea.",
    cost: "Eight-pixel type. Legible on a desktop frame, genuinely marginal on a phone, and it forces the plates apart so fewer fit before the arc has to wrap to two rows.",
  },
};

export default function StackArcLab() {
  const [style, setStyle] = useState<ArcStyle>("leader");
  const [axis, setAxis] = useState<ArcAxis>("column");
  const note = NOTES[style];

  return (
    <div className="shell py-14">
      <div
        role="tablist"
        aria-label="Detail treatments"
        className="flex flex-wrap gap-2"
      >
        {STYLES.map((s) => {
          const on = s.key === style;
          return (
            <button
              key={s.key}
              role="tab"
              type="button"
              aria-selected={on}
              onClick={() => setStyle(s.key)}
              className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition-all ${
                on
                  ? "border-transparent bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground"
              }`}
            >
              {s.name}
            </button>
          );
        })}
      </div>

      {/* The axis is a second, independent axis of the comparison — every
          treatment is worth seeing both ways round, so it is its own control
          rather than five more entries in the row above. */}
      <div
        role="tablist"
        aria-label="Mark axis"
        className="mt-3 flex flex-wrap gap-2"
      >
        {AXES.map((a) => {
          const on = a.key === axis;
          return (
            <button
              key={a.key}
              role="tab"
              type="button"
              aria-selected={on}
              onClick={() => setAxis(a.key)}
              className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-all ${
                on
                  ? "border-accent/50 bg-accent/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground"
              }`}
            >
              {a.name}
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[390px_1fr] lg:items-start">
        <div className="min-w-0">
          <div className="mx-auto w-full max-w-[390px] rounded-[2rem] border-[10px] border-foreground/85 bg-secondary shadow-2xl">
            <div className="max-h-[760px] min-w-0 overflow-y-auto rounded-[1.25rem] p-4 [scrollbar-width:thin]">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-accent-strong">
                Proven technology stacks
              </p>
              <h2 className="mb-4 font-display text-[22px] font-medium leading-[1.15] tracking-[-0.02em] text-foreground">
                We don&rsquo;t chase trends, we build on what works.
              </h2>
              <StackArc key={`${style}-${axis}`} style={style} axis={axis} />
            </div>
          </div>
          <p className="mt-3 text-center text-[12px] text-muted-foreground">
            Pick a service, then compare treatments. Backend has four groups
            and thirteen marks, the hardest case.
          </p>
        </div>

        <div className="min-w-0">
          <div className="rounded-3xl border border-border bg-card p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-strong">
              {STYLES.find((s) => s.key === style)!.name}
            </p>
            <p className="mt-3 text-[15px] leading-[1.75] text-muted-strong">
              {note.what}
            </p>
            <p className="mt-4 border-t border-hairline pt-4 text-[14px] leading-[1.7] text-muted-foreground">
              <span className="mr-2 text-[11px] font-bold uppercase tracking-[0.14em] text-accent-strong">
                What it costs
              </span>
              {note.cost}
            </p>
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-card p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-strong">
              Axis · {AXES.find((a) => a.key === axis)!.name}
            </p>
            <p className="mt-3 text-[15px] leading-[1.75] text-muted-strong">
              {axis === "column"
                ? "One group, one column. The group boundary stops being a gap the reader has to judge and becomes the whitespace between columns, and every label sits over exactly one thing rather than over a run of marks. It also lifts the constraint that made Named awkward: tags collided because they sat side by side, and stacked they only need height, of which there is far more than width."
                : "Marks laid out along the arc, groups as runs. Shallower, so more of the fan's curve is visible, and a service with many small groups stays on one line. The cost is that where one group ends and the next begins is a judgement, which is exactly what the leader lines and brackets exist to repair."}
            </p>
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-secondary p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-strong">
              What changed from the first arc
            </p>
            <ul className="mt-4 flex flex-col gap-3 text-[14px] leading-[1.7] text-muted-foreground">
              <li>
                <strong className="font-semibold text-foreground">
                  It is an arc now.
                </strong>{" "}
                The old one pushed each column back by{" "}
                <code>z = -|x| · 0.55</code>, which is a V with a crease in the
                middle. This is a real circular sweep: radius 430, span 1.25
                radians, every plate turned to face one centre of curvature.
              </li>
              <li>
                <strong className="font-semibold text-foreground">
                  Labels are projected, not guessed.
                </strong>{" "}
                On a curve, a group 81 units further away projects inward, so
                a label placed at the group&rsquo;s <em>x</em> drifts off it
                towards the ends of the fan. Each label is now placed by
                casting the camera ray through its group and intersecting the
                label plane, so it lands dead centre whatever the depth.
              </li>
              <li>
                <strong className="font-semibold text-foreground">
                  Lines are unscaled, labels are not.
                </strong>{" "}
                A line&rsquo;s length is a measurement and has to stay a world
                measurement; a label&rsquo;s size is an appearance and must not
                grow as it comes forward. So labels carry the{" "}
                <code>(560−z)/560</code> compensation and the lines do not.
              </li>
              <li>
                <strong className="font-semibold text-foreground">
                  An open arc holds still.
                </strong>{" "}
                Readable-without-rotation is the whole reason this arrangement
                won, so opening a service eases the spin to zero instead of
                drifting away from it. A drag still works.
              </li>
            </ul>
          </div>

          <p className="mt-6 max-w-xl rounded-2xl border border-border bg-card p-5 text-[14px] leading-[1.7] text-muted-foreground">
            <strong className="font-semibold text-foreground">
              Still not a ship candidate.
            </strong>{" "}
            ~150KB of library for a proof section, the object is{" "}
            <code>aria-hidden</code> with the real content in the list beneath,
            and nothing here has been measured on a mid-range Android. What
            this page settles is which treatment to build if the idea is taken
            further, not whether to take it further.
          </p>
        </div>
      </div>
    </div>
  );
}
