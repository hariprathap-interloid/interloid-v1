"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { MODES, type Mode } from "./Stack3DDrill";

/* The scene pulls three.js in, so it is dynamic and client-only: the library
   must not sit in this route's server render or its first-paint bundle. */
const Stack3DDrill = dynamic(() => import("./Stack3DDrill"), {
  ssr: false,
  loading: () => (
    <p className="grid h-[420px] place-items-center rounded-[1.25rem] border border-border bg-card text-[12px] text-muted-foreground">
      loading three.js…
    </p>
  ),
});

/* ==========================================================================
   /stack-3d's switcher and the notes beside it.
   ==========================================================================
   ONE SCENE PER MODE, remounted on change — unlike /stack-lab's arrangement
   switcher, which morphs. That is deliberate and it is the opposite call for
   a reason: there, the arrangements were alternative homes for the SAME 62
   marks and the morph was the comparison. Here, each mode is a different
   answer to "what shape should a service's groups take", and they are judged
   by opening a service inside each one, not by watching them interpolate. A
   morph between two level-2 layouts would also have to interpolate the
   labels, which reads as a mess rather than as a relationship.
   ========================================================================== */

const NOTES: Record<Mode, string> = {
  carousel:
    "Stacked rings, one per group. Reads the groups as equal parallel shelves; no group looks more important than another, which for “Frontend frameworks / Styling & UI / Build tools” is true. Needs rotation to read: at rest the back half of every ring is facing away.",
  helix:
    "One continuous spiral, groups as consecutive turns. The only arrangement that implies ORDER, and that is a claim: it is arguably right for a build pipeline and wrong for “Databases / Python ecosystem / Ruby ecosystem”, which have no sequence at all. Use it only where the groups really do follow one another.",
  bands:
    "Stacked rings again, but flatter, wider, and labelled outboard rather than inside the stack. The most diagram-like of the five and the least toy-like, closest in spirit to the desktop ecosystem map.",
  orbit:
    "Concentric tilted rings around the service. Groups become distance from a centre, so it reads as a system with a core, which matches how the desktop map already draws the business. The outer rings get crowded when a service has five groups.",
  arc: "A front-facing fan, groups as columns. The only arrangement that is fully readable WITHOUT rotation, which makes it the only one that survives a screenshot, a reduced-motion setting, or a reader who never thinks to drag. Least three-dimensional, and that is the trade.",
};

export default function Stack3DLab() {
  const [mode, setMode] = useState<Mode>("carousel");

  return (
    <div className="shell py-14">
      <div
        role="tablist"
        aria-label="Level-2 arrangements"
        className="flex flex-wrap gap-2"
      >
        {MODES.map((m) => {
          const on = m.key === mode;
          return (
            <button
              key={m.key}
              role="tab"
              type="button"
              aria-selected={on}
              onClick={() => setMode(m.key)}
              className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition-all ${
                on
                  ? "border-transparent bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground"
              }`}
            >
              {m.name}
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
              {/* `key` remounts the scene per mode — see the banner for why
                  this one does NOT morph where /stack-lab's switcher does. */}
              <Stack3DDrill key={mode} mode={mode} />
            </div>
          </div>
          <p className="mt-3 text-center text-[12px] text-muted-foreground">
            Up to 390 × 844, scrolls inside the frame
          </p>
        </div>

        <div className="min-w-0">
          <div className="rounded-3xl border border-border bg-card p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-strong">
              Level 2 · {MODES.find((m) => m.key === mode)!.name}
            </p>
            <p className="mt-3 text-[15px] leading-[1.75] text-muted-strong">
              {NOTES[mode]}
            </p>
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-secondary p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-strong">
              How to read it
            </p>
            <ol className="mt-4 flex flex-col gap-3 text-[14px] leading-[1.7] text-muted-foreground">
              <li>
                <strong className="font-semibold text-foreground">
                  Level 1 · the sphere.
                </strong>{" "}
                All 62 marks, no hierarchy, no labels. It answers &ldquo;how
                much is there&rdquo; and nothing else.
              </li>
              <li>
                <strong className="font-semibold text-foreground">
                  Level 2 · pick a service.
                </strong>{" "}
                Its marks grow and re-form, one ring or column per group, with
                the group named beside it. The rest fall back to a dim shell, still there, still counted.
              </li>
              <li>
                <strong className="font-semibold text-foreground">
                  Level 3 · tap a mark.
                </strong>{" "}
                It grows again and names itself. Dragging never selects: a
                gesture that moved more than 3px is a spin, not a tap.
              </li>
              <li>
                <strong className="font-semibold text-foreground">
                  The spin slows as you go down.
                </strong>{" "}
                Measured drift per second: 4px at level 1, 1px at level 2, 0
                at level 3. Hitting a 44px plate on a freely rotating object
                is a moving-target problem; this is the fix, not a flourish.
              </li>
            </ol>
          </div>

          <p className="mt-6 max-w-xl rounded-2xl border border-border bg-card p-5 text-[14px] leading-[1.7] text-muted-foreground">
            <strong className="font-semibold text-foreground">
              Before this could ship.
            </strong>{" "}
            It is ~150KB of library for a proof section; the object is{" "}
            <code>aria-hidden</code> with the real content in the list beneath
            it; and none of it has been measured on a mid-range Android, which
            is where a 62-node CSS 3D scene will struggle first. Treat this as
            a design question with a working prototype attached, not as a
            candidate.
          </p>
        </div>
      </div>
    </div>
  );
}
