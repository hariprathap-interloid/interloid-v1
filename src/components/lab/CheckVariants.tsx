"use client";

import { useState } from "react";
import Icon from "../Icon";

/* ==========================================================================
   CHECK-MARK VARIANTS — the specimen set for /check-lab.
   ==========================================================================
   The question this page exists to answer: the plain Lucide tick is used in
   ELEVEN components (brief/parts, CtaAnchor, HiringPath, Roles, and six of
   the /services sections), and at that density it stops reading as "verified"
   and starts reading as texture. What should replace it — site-wide?

   ── WHY A SWITCHER AND NOT A STACK ───────────────────────────────────────
   The same lesson /service-variants learned: six specimen blocks down a page
   can only be compared by scrolling between them from memory, and the one at
   the top always wins because it is the one you saw rested. Swapped IN PLACE
   the rows land on the same pixels, so the mark is the only thing that moves.

   ── THE THREE CONTEXTS ARE NOT DECORATION ────────────────────────────────
   A tick that looks right beside one short line can be far too loud down a
   five-item list, and a mark tuned for the light card can vanish on the dark
   CTA slab, which uses a different palette entirely (`--spark`, not
   `--accent`). So every variant is shown against all three of the real places
   the tick is actually used, with the real copy:

     DENSE     CapabilityShowcase's "What you get" — short, four deep
     PROSE     EngagementPanel's terms — two-line items, five deep
     ON DARK   CtaAnchor's meta row — the ink slab, `--spark` accents

   ── ADOPTING ONE ─────────────────────────────────────────────────────────
   Each variant here is self-contained markup. The winner does NOT get pasted
   into eleven files: add it to `ICONS` in Icon.tsx (or, for the wrapped
   variants, export a small <Check /> from components/) and swap the eleven
   call sites to it. Anything that needs a wrapper element is marked below.

   Not linked, noindex. Delete this file and its route with the losing ones.
   ========================================================================== */

export type CheckVariant = {
  key: string;
  name: string;
  note: string;
  /** True when the mark needs a wrapping element, not just a new icon path —
      i.e. adopting it is a <Check /> component, not an ICONS entry. */
  wrapper: boolean;
};

export const CHECK_VARIANTS: CheckVariant[] = [
  {
    key: "plain",
    name: "Plain tick",
    note: "What ships today. Lucide check, stroke 2, accent colour, no container. Lightest possible, and the reason the lists read as texture at this density.",
    wrapper: false,
  },
  {
    key: "disc",
    name: "Filled disc",
    note: "Solid accent circle, white tick. Reads unmistakably as “confirmed”. Strongest of the set — and the one most at risk of becoming a row of dots down a long list.",
    wrapper: true,
  },
  {
    key: "ring",
    name: "Outline ring",
    note: "Hairline ring, accent tick inside. Close to the current weight but bounded, so each item reads as one unit. The safe middle.",
    wrapper: true,
  },
  {
    key: "ring-draw",
    name: "Ring, tick draws in",
    note: "The ring fades up and the tick strokes on, staggered down the list. Most characterful; it is also motion on every bulleted list in the app. Honours prefers-reduced-motion.",
    wrapper: true,
  },
  {
    key: "tint",
    name: "Tinted tile",
    note: "Soft accent square with the tick in it — the same device the capability and principle icons already use, so the page gains no new vocabulary.",
    wrapper: true,
  },
  {
    key: "rule",
    name: "No tick at all",
    note: "A short accent rule instead. The control: if the list reads just as well without a tick, eleven ticks were never carrying meaning.",
    wrapper: true,
  },
];

/* `onDark` swaps the light card palette for the CTA slab's. The two are NOT
   the same accent — globals.css §the dark slab's own accents explains why —
   so every variant has to name both rather than lean on a token that flips. */
function Mark({
  variant,
  i,
  onDark,
  cycle,
}: {
  variant: string;
  i: number;
  onDark?: boolean;
  cycle: number;
}) {
  const ink = onDark ? "text-spark" : "text-accent-strong";
  const solid = onDark
    ? "bg-spark text-ink"
    : "bg-accent-strong text-accent-foreground";
  const ringed = onDark ? "ring-spark/40" : "ring-accent/40";
  const tinted = onDark ? "bg-spark/15" : "bg-accent/12";

  if (variant === "plain") {
    return (
      <span className={`mt-0.5 shrink-0 ${ink}`} aria-hidden="true">
        <Icon name="check" className="size-4" />
      </span>
    );
  }

  if (variant === "rule") {
    return (
      <span
        className={`mt-2.5 h-px w-4 shrink-0 rounded-full ${
          onDark ? "bg-spark" : "bg-accent-strong"
        }`}
        aria-hidden="true"
      />
    );
  }

  if (variant === "disc") {
    return (
      <span
        className={`mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full ${solid}`}
        aria-hidden="true"
      >
        <Icon name="check" className="size-[11px]" />
      </span>
    );
  }

  if (variant === "tint") {
    return (
      <span
        className={`mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-[6px] ${tinted} ${ink}`}
        aria-hidden="true"
      >
        <Icon name="check" className="size-3" />
      </span>
    );
  }

  if (variant === "ring") {
    return (
      <span
        className={`mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full ring-1 ${ringed} ${ink}`}
        aria-hidden="true"
      >
        <Icon name="check" className="size-3" />
      </span>
    );
  }

  /* ring-draw. The tick is drawn by animating stroke-dashoffset from its own
     length to zero; `pathLength={1}` normalises that length to 1 so the
     numbers do not depend on the path's real geometry. `key` on the <svg>
     remounts it when the Replay button bumps `cycle`, which is the only
     reliable way to restart a CSS animation. */
  const delay = `${i * 90}ms`;
  return (
    <span
      key={cycle}
      className={`check-draw mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full ring-1 ${ringed} ${ink}`}
      style={{ animationDelay: delay }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="size-3" fill="none">
        <path
          d="M20 6 9 17l-5-5"
          pathLength={1}
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="check-draw-path"
          style={{ animationDelay: `calc(${delay} + 120ms)` }}
        />
      </svg>
    </span>
  );
}

const DENSE = [
  "A focused first version in 8–12 weeks, not quarters — with a working demo every week from week one.",
  "SEO-optimised from day one, and an architecture that scales to millions of users.",
  "You own 100% of the code — zero vendor lock-in.",
  "Engineers with 8–12 years each, no juniors substituted after signing.",
];

const PROSE = [
  "A fixed price or a transparent hourly rate, in writing within 48 hours of the first call.",
  "A focused first version in 8–12 weeks; larger platforms run 14–20.",
  "A working demo every week from week one — software you can click, not a status report.",
  "Your GitHub organisation and your cloud accounts from the first commit. There is no handover ceremony because nothing of yours is ever in our hands.",
  "30 days of post-launch support included; a retainer after that is an option, never a dependency.",
];

const ON_DARK = [
  "A free 30-minute call, no obligation",
  "A written scope and price in 48 hours",
  "An honest no if you don't need us",
];

export default function CheckVariants() {
  const [active, setActive] = useState(CHECK_VARIANTS[0].key);
  const [cycle, setCycle] = useState(0);
  const current = CHECK_VARIANTS.find((v) => v.key === active)!;

  return (
    <div className="shell py-16">
      {/* ---- the switcher ------------------------------------------------ */}
      <div
        role="tablist"
        aria-label="Check-mark variants"
        className="flex flex-wrap gap-2"
      >
        {CHECK_VARIANTS.map((v) => {
          const on = v.key === active;
          return (
            <button
              key={v.key}
              role="tab"
              type="button"
              aria-selected={on}
              onClick={() => {
                setActive(v.key);
                setCycle((c) => c + 1);
              }}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all ${
                on
                  ? "border-transparent bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground"
              }`}
            >
              {v.name}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setCycle((c) => c + 1)}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
        >
          <Icon name="repeat" className="size-4 text-accent-strong" />
          Replay
        </button>
      </div>

      <p className="mt-6 max-w-3xl text-[15px] leading-[1.75] text-muted-strong">
        <span className="mr-2 text-[11px] font-bold uppercase tracking-[0.14em] text-accent-strong">
          {current.wrapper ? "Needs a <Check /> component" : "Icon swap only"}
        </span>
        {current.note}
      </p>

      {/* ---- the three contexts ------------------------------------------ */}
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <section className="rounded-4xl border border-border bg-card p-8">
          <h2 className="mb-1 font-display text-lg font-bold text-foreground">
            Dense
          </h2>
          <p className="mb-6 text-[13px] text-muted-foreground">
            CapabilityShowcase — “What you get”. Four short items, repeated six
            times down /services.
          </p>
          <h3 className="mb-4 flex items-center gap-2 font-display text-[12px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            What you get
          </h3>
          <ul className="space-y-3">
            {DENSE.map((t, i) => (
              <li
                key={t}
                className="flex gap-3 text-[15px] leading-[1.7] text-muted-strong"
              >
                <Mark variant={active} i={i} cycle={cycle} />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-4xl border border-border bg-card p-8">
          <h2 className="mb-1 font-display text-lg font-bold text-foreground">
            Prose
          </h2>
          <p className="mb-6 text-[13px] text-muted-foreground">
            EngagementPanel — the terms. Five items, most of them two lines.
          </p>
          <h3 className="mb-4 flex items-center gap-2 font-display text-[12px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            The terms
          </h3>
          <ul className="space-y-3.5">
            {PROSE.map((t, i) => (
              <li
                key={t}
                className="flex gap-3 text-[15px] leading-[1.7] text-muted-strong"
              >
                <Mark variant={active} i={i} cycle={cycle} />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-4xl border border-border bg-ink p-8 lg:col-span-2">
          <h2 className="mb-1 font-display text-lg font-bold text-white">
            On the dark slab
          </h2>
          <p className="mb-6 text-[13px] text-ink-muted">
            CtaAnchor — the meta row under every page&rsquo;s closing CTA. A
            different palette entirely: <code>--spark</code>, not{" "}
            <code>--accent</code>. A mark tuned only for the light card
            disappears here.
          </p>
          <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8">
            {ON_DARK.map((t, i) => (
              <li
                key={t}
                className="flex items-center gap-2 text-[13px] text-ink-muted"
              >
                <Mark variant={active} i={i} cycle={cycle} onDark />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ---- every variant at once, small ---------------------------------
          The switcher is for judging a mark IN CONTEXT; this row is for the
          one question the switcher cannot answer, which is how they differ
          from each other at a glance. */}
      <section className="mt-8 rounded-4xl border border-border bg-secondary p-8">
        <h2 className="mb-6 font-display text-lg font-bold text-foreground">
          Side by side
        </h2>
        <div className="flex flex-wrap gap-x-10 gap-y-6">
          {CHECK_VARIANTS.map((v) => (
            <div key={v.key} className="flex items-center gap-3">
              <Mark variant={v.key} i={0} cycle={cycle} />
              <span className="text-sm text-muted-strong">{v.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
