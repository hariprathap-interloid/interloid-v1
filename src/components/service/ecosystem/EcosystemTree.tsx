"use client";

import { Fragment, useEffect, useState } from "react";
import TechLogo from "../TechLogo";
import { CAPABILITIES, type Tech } from "@/content/service";
import { HUE } from "@/content/site";
import { Core, EcosystemList, ServiceNode } from "./parts";
import { DotEdge } from "./parts";
import { useEcosystem } from "./useEcosystem";

/* ==========================================================================
   VARIANT F — TECH TREE
   ==========================================================================
   Not a wheel. A trunk at the bottom centre (the Interloid core), six limbs
   leaving it at six different heights, each limb carrying one service; every
   service's spine carries its stack GROUPS as rungs, and every group sprays
   its TECHNOLOGIES as circular plates — the leaves.

   The point of this variant, and the reason it exists: ALL 62 MARKS ARE ON
   SCREEN AT ONCE, ALWAYS. Nothing is behind a hover. Opening a service does
   not reveal its technologies, it *lights the ones already visible* and fades
   the other five branches back. The user asked for "instead of 3 level badge
   direct view all the tech icons"; this is the layout that answers it.

   ── WHY NOT geometry.ts ──────────────────────────────────────────────────
   Every helper in geometry.ts is polar and expressed as a percentage of a
   SQUARE stage. A tree is neither: it is a 4:3 box with a distinguished
   "up", and its collision problem is rectangular (columns and rungs), not
   angular. So the maths below is local to this file — it does not touch,
   fork or contradict the shared module, it simply solves a different shape.

   ── THE COLLISION PROBLEM, AND HOW IT IS ACTUALLY SOLVED ─────────────────
   62 plates of 36px, 20 group labels and 6 service nodes on one canvas, with
   nothing touching. Guessing does not survive it; the layout is therefore
   derived from ONE measured constant:

     the stage is `aspect-[4/3] w-full max-w-[1180px]` inside a `max-w-7xl
     px-6` column, so at the `lg` breakpoint (1024px viewport) it is exactly
     976px wide. That is the TIGHTEST it ever gets, and every clearance below
     is computed at that width. Wider stages only add daylight.

   With 1200 logical units across 976px, one unit is 0.8133px, so a 36px
   plate is 44.3 units and any two boxes need ~52 units of centre-to-centre
   separation on one axis to keep 6px of daylight. Everything else follows:

     · SIX COLUMNS 200 units apart. A column may spend 184 units on leaves,
       which leaves a 16-unit street between neighbouring canopies.
     · A group of ≤3 marks is a flat row at a 56-unit pitch (45.5px — clears).
       A group of 4 or 6 cannot be flat: 6 marks at a pitch that fits the
       column is 28 units = 22.8px, and the plates would overlap by 13px. So
       those rows ZIGZAG, ±27 units, which puts 43.9px between neighbours on
       the *vertical* axis instead — two boxes miss each other if they miss on
       EITHER axis, and a zigzag is also what a real twig looks like.
     · RUNGS 58 units apart plus the row's own amplitude, so a group label
       never reaches the row above or below it.
     · The group label is the one place this file does not reuse `GroupPill`:
       that pill is `whitespace-nowrap`, and "Containers & orchestration" sets
       ~227px wide — 139 units of half-width against 112 units of clearance to
       the next column's leaves. It would overlap, measured. The label here
       wraps inside `max-w-[150px]` instead, which is 92 units of half-width
       and fits the street. Same tokens, same hue, two lines instead of one.

   ── WHY THE SERVICE NODES SIT AT SIX DIFFERENT HEIGHTS ───────────────────
   Not decoration. Two independent reasons:
     1. the service LABEL pill under each node is ~200 units wide against a
        200-unit column pitch, so two neighbouring nodes at the same height
        would have overlapping labels. They are staggered by ≥60 units.
     2. content differs wildly — Backend and Cloud need 515 and 542 units of
        canopy, Staff Augmentation needs 310. Dropping the tall ones closer to
        the trunk and lifting the short ones on a longer bare stem is what
        levels the canopy into a mound instead of a comb.

   ── MOTION ───────────────────────────────────────────────────────────────
   The limbs, spines and twigs are `.eco-line` paths with `pathLength=1`, so
   the site's own reveal observer DRAWS THE WHOLE TREE ON when the section
   scrolls in, trunk first and leaves last. Opening a service is a CSS
   transition on opacity, stroke-width and scale only — no keyframes are
   added, globals.css is untouched, and `prefers-reduced-motion` is honoured
   at component level by `useCalm()` below, which zeroes the stagger as well
   as the durations (the global block flattens duration but NOT delay).
   ========================================================================== */

/* ── THE UNITS ─────────────────────────────────────────────────────────── */
const W = 1200; // logical width  — the stage is aspect-[4/3]
const H = 900; // logical height
/** The narrowest the stage is ever rendered: `lg` viewport 1024 − the page's
    px-6 gutters − max-w-7xl. Every clearance in this file is checked here. */
const MIN_STAGE = 976;
const U = MIN_STAGE / W; // 0.8133 px per unit, at the tightest stage
/* 40, not 36: the marks became `md` circles when level 3 stopped being a
   badge. EVERY clearance in this file is derived from PLATE, so this constant
   is the one that has to move when the mark does - leaving it at 36 would
   silently under-reserve space for all 62 leaves. */
const PLATE = 40; // TechLogo size="md" circle, px
const DAYLIGHT = 6; // px we insist on between any two boxes
/* The group label's half-height in UNITS. The label is a two-line pill at
   ~34px; half of that, converted, is where a twig may start. */
const GROUP_HALF = 34 / 2 / U;
/** Minimum centre-to-centre separation on one axis, in units. ~52. */
const SAFE = (PLATE + DAYLIGHT) / U;

const pctX = (x: number) => `${(x / W) * 100}%`;
const pctY = (y: number) => `${(y / H) * 100}%`;

/* ── THE SKELETON ──────────────────────────────────────────────────────────
   Six columns, left to right in CAPABILITIES order so the roving tabindex's
   ArrowRight moves rightward on screen — a tablist whose arrow keys disagree
   with the picture is worse than no arrow keys. */
const COL_X = [100, 300, 500, 700, 900, 1100];

/** Node heights. Adjacent columns differ by ≥60 units so the label pills
    beneath them cannot collide; the tall-canopy services (Backend, Cloud)
    sit lowest because they need the most room above. */
const NODE_Y = [510, 445, 585, 645, 560, 470];

/** Node centre → first group label. 82 is the minimum (39 units of scaled
    node half + 24.6 of label half + 12 of air). The surplus on Cloud and
    Staff Augmentation is a deliberately LONGER BARE STEM: it lifts a short
    canopy up to the height of its neighbours instead of stretching the gaps
    inside it, which is both how a tree looks and how the mound is levelled. */
const STEM = [82, 82, 82, 112, 82, 162];

/** Where each limb leaves the trunk. Outer services leave LOWEST and travel
    furthest — the arrangement every real tree has, and the one that keeps six
    limbs from crossing. */
const ATTACH_Y = [745, 715, 690, 683, 708, 738];

const TRUNK_X = 600;
const CORE_Y = 822; // core is 116px fixed = 142.6 units tall; 822+71.3 < 900
const TRUNK_TOP = 672; // just above the highest attachment (683)

const LEAF_HALF = 22; // 18px plate half, in units
const LABEL_HALF = 24.6; // a two-line group label is ~40px tall
const RUNG = 58; // label centre → row centre, before the row's amplitude
const ZIG = 27; // zigzag amplitude: 2×27 units = 43.9px > 42px needed

/** One group's marks, laid out relative to the column spine.

    A row is FLAT when its pitch already clears a plate; otherwise it
    ZIGZAGS. That single rule is what makes a six-mark group ("Frontend
    frameworks", "Core expertise") fit a 200-unit column at all: flat it would
    need 320 units, zigzagged it needs 184. */
function spray(n: number) {
  if (n < 2) return { amp: 0, pts: [{ dx: 0, dy: 0 }] };
  /* 132 = the widest half-span a column may spend on either side of its
     spine, doubled. Clamped: never tighter than 28 (which keeps i and i+2
     45.5px apart) and never wider than 56 (which is a flat row's own
     clearance — beyond that the row just looks loose). */
  const pitch = Math.min(56, Math.max(28, 132 / (n - 1)));
  const amp = pitch < SAFE ? ZIG : 0;
  return {
    amp,
    pts: Array.from({ length: n }, (_, i) => ({
      dx: (i - (n - 1) / 2) * pitch,
      dy: amp === 0 ? 0 : i % 2 === 0 ? -amp : amp,
    })),
  };
}

type Leaf = { tech: Tech; x: number; y: number };
type Group = { label: string; x: number; y: number; leaves: Leaf[] };
type Branch = {
  x: number;
  y: number;
  groups: Group[];
  limb: string;
  spine: string;
  twigs: string[];
};

/* Computed once, at module scope: the layout depends on nothing but the
   content, so it is not recomputed on every hover. */
const TREE: Branch[] = CAPABILITIES.map((cap, i) => {
  const nx = COL_X[i];
  const ny = NODE_Y[i];

  let cursor = ny - STEM[i];
  const groups: Group[] = cap.stack.map((g) => {
    const sp = spray(g.items.length);
    const labelY = cursor;
    const rowY = labelY - (RUNG + sp.amp);
    const leaves = g.items.map((t, ti) => ({
      tech: t,
      x: nx + sp.pts[ti].dx,
      y: rowY + sp.pts[ti].dy,
    }));
    /* Symmetrical: the next label is as far above this row as this row is
       above this label, so a rung never crowds the row it belongs to. */
    cursor = rowY - (RUNG + sp.amp);
    return { label: g.group, x: nx, y: labelY, leaves };
  });

  /* THE LIMB. A cubic that leaves the trunk heading OUTWARD and arrives at
     the node heading UP — the S a branch actually makes. c1 pushes 42% of the
     horizontal distance while barely rising (the branch leaving the trunk);
     c2 sits directly under the node (the branch straightening into it). */
  const ay = ATTACH_Y[i];
  const dx = nx - TRUNK_X;
  const dy = ay - ny;
  const limb = `M${TRUNK_X},${ay} C${TRUNK_X + dx * 0.42},${ay - dy * 0.12} ${nx},${
    ny + dy * 0.58
  } ${nx},${ny}`;

  /* THE SPINE, node → topmost rung, bowed 5 units to one side so six columns
     are not six rulers. The bow alternates by column index. */
  const topY = groups[groups.length - 1].y;
  const bow = i % 2 === 0 ? -10 : 10;
  const spine = `M${nx},${ny} Q${nx + bow},${(ny + topY) / 2} ${nx},${topY}`;

  /* THE TWIGS. Out of the top of each group label, up and then across to each
     mark. The centre mark of an odd row gets a straight vertical, which is
     correct — that is the twig the spine continues into. */
  const twigs = groups.flatMap((g) =>
    g.leaves.map((lf) => {
      /* THE LABEL'S TOP EDGE, not a flat 20 units above its centre. The old
         constant was neither the edge nor the centre, so the fan converged at
         a point floating above the node and read as unattached - the user
         spotted it before this did. GROUP_HALF is derived from the label's
         own height, so the two cannot drift apart again. */
      const sy = g.y - GROUP_HALF;
      const mid = sy + (lf.y - sy) * 0.55;
      return `M${g.x},${sy} C${g.x},${mid} ${lf.x},${mid} ${lf.x},${lf.y}`;
    }),
  );

  return { x: nx, y: ny, groups, limb, spine, twigs };
});

/* ── REDUCED MOTION, AT COMPONENT LEVEL ────────────────────────────────────
   globals.css's global block flattens `transition-duration` but leaves
   `transition-delay` alone, so a staggered branch would still arrive in
   dribs under `reduce`. This kills the stagger too. State, not a media query
   in CSS, because the delays are per-element numbers. First render matches
   the server (stagger on); the effect flips it before anything can move. */
function useCalm() {
  const [calm, setCalm] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setCalm(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return calm;
}

/* ── A LEAF ────────────────────────────────────────────────────────────────
   The mark itself is TechLogo, exactly as the other variants use it, so a
   plate looks identical across all of them. The name is a hover/focus
   tooltip; the accessible name is already on the plate.

   `align` is not cosmetic. The outermost leaves sit 6px from the stage edge,
   and a centred `whitespace-nowrap` tooltip on one of them would stick ~40px
   past it — enough to extend the document's scroll width at the `lg`
   breakpoint, where the stage and its column are the same 976px. The two
   outer columns anchor their tooltips inward instead. */
function TreeLeaf({
  tech,
  x,
  y,
  align,
  opacity,
  scale,
  delay,
  calm,
}: {
  tech: Tech;
  x: number;
  y: number;
  align: "start" | "centre" | "end";
  opacity: number;
  scale: number;
  delay: number;
  calm: boolean;
}) {
  const tip =
    align === "start"
      ? "left-0"
      : align === "end"
        ? "right-0"
        : "left-1/2 -translate-x-1/2";
  return (
    <span
      data-tree-leaf
      className="pointer-events-auto group/leaf absolute z-[1] hover:z-20"
      style={{
        left: pctX(x),
        top: pctY(y),
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        transition: calm
          ? "none"
          : `opacity .4s ease ${delay}ms, transform .45s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      }}
    >
      <span className="block transition-transform duration-300 group-hover/leaf:scale-125">
        {/* `sm` and rounded - the tree's OLDER mark, restored on request.
            The circular `md` mark that every other variant uses made this
            canopy read as heavier and less legible: 62 discs at 40px is a
            lot of white at this density, where 36px squares sit quieter
            among the twigs. PLATE below still reserves 40px, so the extra
            4px is simply daylight. */}
        <TechLogo tech={tech} size="sm" />
      </span>
      <span
        className={`pointer-events-none absolute top-full z-10 mt-1.5 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-[10px] font-semibold text-foreground opacity-0 shadow-md transition-opacity duration-200 group-hover/leaf:opacity-100 ${tip}`}
      >
        {tech.name}
      </span>
    </span>
  );
}

/* ── A GROUP LABEL ─────────────────────────────────────────────────────────
   GroupPill's twin, minus `whitespace-nowrap` — see the header note. Same
   hue tokens, same weight, wrapped to a width the column can actually
   afford. */
function TreeRung({
  label,
  hue,
  x,
  y,
  opacity,
  delay,
  calm,
}: {
  label: string;
  hue: keyof typeof HUE;
  x: number;
  y: number;
  opacity: number;
  delay: number;
  calm: boolean;
}) {
  const h = HUE[hue];
  return (
    <span
      data-tree-rung
      className={`eco-group pointer-events-none absolute max-w-[150px] rounded-lg border border-border bg-card px-2 py-1 text-center text-[10px] font-bold uppercase leading-[1.3] tracking-[0.1em] shadow-sm ring-1  `}
      style={{
        left: pctX(x),
        top: pctY(y),
        transform: "translate(-50%, -50%)",
        opacity,
        transition: calm ? "none" : `opacity .35s ease ${delay}ms`,
      }}
    >
      {label}
    </span>
  );
}

export default function EcosystemTree({
  idPrefix = "tree",
}: {
  idPrefix?: string;
}) {
  const eco = useEcosystem(idPrefix);
  const calm = useCalm();
  const activeCap = CAPABILITIES[eco.active];
  const activeTech = activeCap.stack.reduce((n, g) => n + g.items.length, 0);

  return (
    <>
      {/* The stage is `hidden lg:block` — the breakpoint is on the STAGE and
          never on a [data-reveal] node, because an element with no box below
          `lg` is never observed and would sit unrevealed forever. */}
      <div
        className="eco-stage relative mx-auto hidden aspect-[4/3] w-full max-w-[1180px] lg:block"
        {...eco.stageProps}
      >
        {/* ---- the wood ------------------------------------------------
            One SVG under everything. No ids, no <defs>, no gradients: this
            component renders twice per page and a duplicated id resolves to
            whichever came first. Per-service colour arrives as `currentColor`
            from HUE[...].text on the <g>, which keeps every class a whole
            literal string. */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="pointer-events-none absolute inset-0 size-full"
          aria-hidden="true"
          fill="none"
          strokeLinecap="round"
        >
          {/* THE SOLID TRUNK, restored on request.

              It was replaced with a filled, tapered shape at 16% opacity on
              the theory that a trunk should narrow. The user read the result
              as too faint to see, which is the more important fact: a trunk
              that cannot be found is not a trunk. Back to the stroke, and it
              keeps `.eco-line` so it still draws itself on scroll-in. */}
          <g className="text-muted-foreground" stroke="currentColor" opacity={0.45}>
            <path
              d={`M${TRUNK_X},${CORE_Y} L${TRUNK_X},${TRUNK_TOP}`}
              pathLength={1}
              className="eco-line"
              strokeWidth={9}
            />
          </g>

          {CAPABILITIES.map((c, i) => {
            const b = TREE[i];
            const lit = eco.engaged && i === eco.active;
            const dim = eco.engaged && i !== eco.active;
            return (
              <g
                key={c.k}
                className={HUE[c.hue].text}
                stroke="currentColor"
                /* Marks the whole open branch as live. The travelling dash
                   rule matches DESCENDANTS, so one attribute here covers the
                   limb, the spine and every twig - parent to last leaf. */
                data-travel={lit ? "true" : undefined}
                style={{
                  opacity: lit ? 0.95 : dim ? 0.16 : 0.5,
                  /* stroke-width is an INHERITED SVG property, so setting it
                     on the group thickens every path in the branch at once
                     and transitions in one place. */
                  strokeWidth: lit ? 3.2 : dim ? 1.3 : 2,
                  transition: calm
                    ? "none"
                    : "opacity .4s ease, stroke-width .4s ease",
                }}
              >
                {/* `.eco-line` + pathLength=1 is the site's own draw-on: the
                    dash is released by [data-reveal].is-in on the wrapper in
                    EcosystemSection, so the tree grows outward from the trunk
                    when the section scrolls into view. */}
                <path
                  d={b.limb}
                  pathLength={1}
                  className="eco-line"
                  style={{ "--d": `${120 + i * 70}ms` } as React.CSSProperties}
                />
                <path
                  d={b.spine}
                  pathLength={1}
                  className="eco-line"
                  style={{ "--d": `${360 + i * 70}ms` } as React.CSSProperties}
                />
                {/* The dots, on the open branch only: limb, spine and every
                    twig, so one runs from the trunk out to each last leaf. */}
                {/* The limb flows whether or not this service is lit —
                    six streams leaving the trunk are the resting state of the
                    tree. The spine and the twigs only exist when it opens. */}
                <DotEdge d={b.limb} />
                {lit && (
                  <>
                    <DotEdge d={b.spine} />
                    {b.twigs.map((d, ti) => (
                      <DotEdge key={`dot${ti}`} d={d} />
                    ))}
                  </>
                )}
                {b.twigs.map((d, ti) => (
                  <path
                    key={ti}
                    d={d}
                    pathLength={1}
                    className="eco-line"
                    strokeWidth={lit ? 2 : 1.2}
                    style={
                      {
                        "--d": `${560 + i * 70 + ti * 16}ms`,
                        transition: calm ? "none" : undefined,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </g>
            );
          })}
        </svg>

        {/* ---- levels 2 and 3, ALWAYS RENDERED AND ALWAYS VISIBLE -------
            Every branch is in the DOM at every moment — Reveal.tsx observes
            once on mount, so nothing revealed may be conditionally rendered —
            and unlike the radial variants nothing here is hidden either. All
            62 marks are on screen at rest; opening a service changes their
            weight, not their existence. */}
        {CAPABILITIES.map((c, i) => {
          const b = TREE[i];
          const lit = eco.engaged && i === eco.active;
          const dim = eco.engaged && i !== eco.active;
          const align =
            b.x < 260 ? "start" : b.x > 940 ? "end" : ("centre" as const);
          return (
            <div
              key={c.k}
              {...eco.panelProps(i)}
              className="pointer-events-none absolute inset-0"
              style={{ zIndex: lit ? 3 : 1 }}
            >
              {b.groups.map((g, gi) => (
                <Fragment key={g.label}>
                  <TreeRung
                    label={g.label}
                    hue={c.hue}
                    x={g.x}
                    y={g.y}
                    /* 0.28 at rest, not 0.5. Twenty group labels at half
                       opacity read as twenty competing headings and made the
                       canopy look busier than it is - the user called them
                       too bright. Still 0 when another branch is open: a
                       closed branch keeps its marks and loses its words. */
                    opacity={lit ? 1 : dim ? 0 : 0.28}
                    delay={calm || !lit ? 0 : 30 + gi * 45}
                    calm={calm}
                  />
                  {g.leaves.map((lf, ti) => (
                    <TreeLeaf
                      key={`${g.label}-${lf.tech.name}`}
                      tech={lf.tech}
                      x={lf.x}
                      y={lf.y}
                      align={align as "start" | "centre" | "end"}
                      /* The dimmed marks were 0.34 at 0.87 scale, which the
                         user read as too small and too faint to identify. A
                         closed branch should be quiet, not illegible: these
                         are the only thing naming a technology, so they stay
                         readable and let the LINES carry the emphasis. */
                      opacity={lit ? 1 : dim ? 0.55 : 0.9}
                      scale={lit ? 1 : 0.96}
                      delay={calm || !lit ? 0 : 70 + gi * 45 + ti * 22}
                      calm={calm}
                    />
                  ))}
                </Fragment>
              ))}
            </div>
          );
        })}

        {/* ---- level 1 --------------------------------------------------
            `absolute inset-0`, never `contents`: a role on a display:contents
            element is a known a11y-tree hazard, and the children are
            absolutely positioned anyway. */}
        <div
          role="tablist"
          aria-label="Interloid services"
          aria-orientation="horizontal"
          className="pointer-events-none absolute inset-0 z-[2] [&>*]:pointer-events-auto"
        >
          {CAPABILITIES.map((c, i) => (
            <ServiceNode
              key={c.k}
              capability={c}
              index={i}
              active={i === eco.active}
              /* NEVER `closed`. In this variant the six labels are the map's
                 legend — the nodes are 200 units apart and staggered in
                 height precisely so all six pills can coexist, and dropping
                 five of them would leave a canopy of unnamed branches. The
                 branch that is open is distinguished by weight instead. */
              closed={false}
              nodeProps={eco.nodeProps(i)}
              style={{ left: pctX(TREE[i].x), top: pctY(TREE[i].y) }}
            />
          ))}
        </div>

        {/* The trunk foot. Core is `left-1/2 top-1/2` of whatever box holds
            it, so a zero-size anchor at the trunk's base is what puts it
            there without touching parts.tsx. */}
        <div className="absolute left-1/2 size-0" style={{ top: pctY(CORE_Y) }}>
          <Core />
        </div>

        {/* The tabpanel swap is silent to a screen reader — one polite line
            names what just opened, not its contents. */}
        <p role="status" aria-live="polite" className="sr-only">
          {activeCap.name}: {activeCap.stack.length} groups, {activeTech}{" "}
          technologies.
        </p>
      </div>

      <EcosystemList capabilities={CAPABILITIES} idPrefix={idPrefix} />
    </>
  );
}
