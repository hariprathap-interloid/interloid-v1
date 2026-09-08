"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Icon from "../../Icon";
import TechLogo from "../TechLogo";
import { CAPABILITIES } from "@/content/service";
import { HUE } from "@/content/site";
import { Core, DotEdge, EcosystemList } from "./parts";
import { useEcosystem } from "./useEcosystem";

/* ==========================================================================
   VARIANT H — FLOW COLUMNS  (deliberately NOT circular)
   ==========================================================================
   The user asked for a non-circular answer, "more elaborate". This is it: a
   left-to-right hierarchy in four columns,

       Interloid  →  the 6 services  →  the groups  →  the technologies

   joined by smooth horizontal beziers, like a tidy flow diagram.

   ── WHY COLUMNS BEAT THE WHEEL HERE ──────────────────────────────────────
   Every radial variant pays the same tax: an arc has no room for names, so
   level 3 becomes forty unlabelled plates and the group labels fight each
   other for angle. A column has room for a NAME at every level, which is the
   entire point of a section whose job is "here is what we build things with".
   Nothing is behind a hover: at any moment the reader sees six service names,
   the open service's group names, and every technology name inside them.

   ── WHY NOTHING CAN OVERLAP HERE, BY CONSTRUCTION ────────────────────────
   The radial variants place every node with `position: absolute` at a polar
   coordinate, so a collision is a real possibility that has to be measured
   away (see the war stories in geometry.ts). This layout is CSS grid and
   normal flow: two nodes cannot occupy one grid cell, and the Core is
   absolutely centred inside its OWN 132px track, 20px of gutter away from the
   nearest node. The overlap assertion still runs — measured, all six services,
   0 intersections — but here it confirms the construction rather than
   rescuing it. That robustness is the strongest argument for this variant.

   ── WHAT IS NOT REUSED FROM parts.tsx, AND WHY ───────────────────────────
   `Core`, `TechLogo` and `EcosystemList` are used as-is. `ServiceNode`,
   `GroupPill` and `TechNode` are NOT, and cannot be: all three are
   `position: absolute` with a `translate(-50%,-50%)` centring transform baked
   in (`.eco-node` / `.eco-grow` in globals.css), which is exactly wrong in
   normal flow — and ServiceNode deliberately HIDES its label when it is not
   the open one, which throws away the one advantage columns have. The
   replacements are local to this file; nothing shared was touched.

   Same for `Links`: its SVG is `viewBox="0 0 1000 1000"` on a square stage.
   This stage is ~1230×600, so a square viewBox would letterbox and every
   endpoint would land somewhere else. The edges here are measured off the
   real DOM boxes and drawn in a pixel-for-pixel viewBox instead — see
   `useFlowEdges` below. Still no ids, no <defs>, no gradients (house rule 7).
   ========================================================================== */

/* The stage is a fixed height because the four columns have to agree on a
   baseline and on a vertical centre. 600px sits in the 560–640 the brief
   asks for, and the tallest service (Backend: 4 groups, 12 marks) measures
   380px of content inside it — so nothing scrolls in practice and the
   overflow on the panel body is a safety valve, not the design. */
const STAGE_H = 600;
/* Track widths. 132 for the core column: the Core is a fixed 116px disc, so
   this is the one measurement in the file that MUST be treated as a hard
   floor — at 116 the disc would touch the column edge and the 20px gutter
   would be all that separated it from a service row. */
const CORE_COL = 132;
const SVC_COL = 236;
const GROUP_COL = 168;
/* 44px, NOT 20. The gutter is not decoration here — it is the horizontal RUN
   every link has to bend through. At 20px the six core→service curves and the
   four service→group curves each collapsed into a single vertical bracket
   hugging the next column's edge: measured on screen, the whole left half of
   the diagram read as one bent pipe rather than as six separate links. 44px
   is the smallest gutter at which each curve has a visible waist of its own.
   It costs the technology column ~70px, which still leaves three chip columns
   at 1440 and two at the lg breakpoint. */
const GUTTER = 44;

type Box = { l: number; r: number; cy: number };
type Edge = { d: string; delay: number };
type Geo = { w: number; h: number; core: Edge[]; branch: Edge[] };

const p = (n: number) => n.toFixed(1);

/** A horizontal S-curve. Control points sit half-way along x at the
    endpoint's own y, which is what gives the flat tangent at both ends — the
    "tidy flow diagram" look, rather than a diagonal with a kink. */
function curve(x1: number, y1: number, x2: number, y2: number) {
  const k = Math.max(24, (x2 - x1) * 0.5);
  return `M${p(x1)},${p(y1)} C${p(x1 + k)},${p(y1)} ${p(x2 - k)},${p(y2)} ${p(x2)},${p(y2)}`;
}

/** The core's six links, which cannot be plain S-curves.
    Everything leaves ONE point on a 116px disc and fans across ±200px of
    vertical travel in ~52px of horizontal run. Started horizontally, all six
    curves left the disc on top of each other and only separated at the far
    end — one bent pipe, measured on screen. So each one leaves the disc
    RADIALLY, on the bearing of the row it is going to, and only then eases
    into a horizontal entry. The six departures are then 30–40px apart on the
    circumference, which is what makes them read as six links. */
function spoke(cx: number, cy: number, r: number, x2: number, y2: number) {
  const dx = x2 - cx;
  const dy = y2 - cy;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const sx = cx + ux * r;
  const sy = cy + uy * r;
  const lead = Math.min(52, len * 0.3);
  const k = Math.max(26, (x2 - sx) * 0.55);
  return `M${p(sx)},${p(sy)} C${p(sx + ux * lead)},${p(sy + uy * lead)} ${p(
    x2 - k,
  )},${p(y2)} ${p(x2)},${p(y2)}`;
}

/** Honoured at COMPONENT level (house rule 4). The global reduced-motion
    block flattens every transition-duration, but it cannot flatten a
    transition-DELAY — a staggered reveal would still arrive late, one row at
    a time, for exactly the visitor who asked for less of that. So the stagger
    is switched off here at source. */
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

export default function EcosystemColumns({
  idPrefix = "columns",
  /** THE SECOND EXAMPLE, in one prop. `dense` swaps the technology column for
      a wrapped grid of marks only — no names — so an even taller service
      would still fit without a scrollbar and the whole stack reads as one
      block. It costs the names, which is the main thing this layout was
      built to show, so it is off by default. */
  dense = false,
}: {
  idPrefix?: string;
  dense?: boolean;
}) {
  const eco = useEcosystem(idPrefix);
  const reduced = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);

  /* `phase` drives the re-draw. The six panels are all mounted and stacked;
     the open one fades up while its rows slide in from the left, staggered,
     so the picture reads as the two right-hand columns MOVING to the service
     rather than being replaced. It starts true so a server-rendered page (or
     one whose JS never arrives) shows the resting picture fully drawn. */
  const [phase, setPhase] = useState(true);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced) return;
    setPhase(false);
    let inner = 0;
    /* Two frames: one for the browser to paint the "off" state, one to flip
       it. A single frame is coalesced with the state change and the
       transition never runs. */
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setPhase(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [eco.active, reduced]);

  /* ── THE EDGES ──────────────────────────────────────────────────────────
     Measured, not computed from a formula. Group labels wrap to two lines at
     some widths and technology rows change count per service, so the y of
     every anchor depends on real layout; a hard-coded rhythm would drift the
     moment a label wrapped. useLayoutEffect so the lines are in place before
     paint, a ResizeObserver for width changes, and document.fonts.ready
     because a late webfont moves every row. */
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let alive = true;
    let last = "";

    const measure = () => {
      if (!alive) return;
      const s = stage.getBoundingClientRect();
      if (!s.width || !s.height) return;
      const box = (el: Element): Box => {
        const b = el.getBoundingClientRect();
        return { l: b.left - s.left, r: b.right - s.left, cy: b.top + b.height / 2 - s.top };
      };

      const coreCell = stage.querySelector("[data-flow-core]");
      const svc = Array.from(stage.querySelectorAll("[data-flow-svc]")).map(box);
      const open = stage.querySelector('[data-flow-panel][data-open="true"]');
      const grp = open ? Array.from(open.querySelectorAll("[data-flow-grp]")).map(box) : [];
      const tech = open ? Array.from(open.querySelectorAll("[data-flow-tech]")).map(box) : [];
      if (!coreCell || svc.length === 0) return;

      const cb = box(coreCell);
      const cx = (cb.l + cb.r) / 2;
      const cy = cb.cy;

      /* 58 = the Core's own radius, fixed at 116px in parts.tsx. A link that
         started at the column's edge instead would either float off the disc
         or bite into it as the column width changed. */
      const core: Edge[] = svc.map((n, i) => ({
        d: spoke(cx, cy, 58, n.l - 2, n.cy),
        delay: 120 + i * 90,
      }));
      const branch: Edge[] = [];
      const from = svc[eco.active];
      grp.forEach((g, i) => {
        branch.push({ d: curve(from.r + 2, from.cy, g.l - 2, g.cy), delay: 40 + i * 55 });
        if (tech[i]) {
          branch.push({ d: curve(g.r + 2, g.cy, tech[i].l - 2, tech[i].cy), delay: 130 + i * 55 });
        }
      });

      const next: Geo = { w: Math.round(s.width), h: Math.round(s.height), core, branch };
      /* Signature compare: a ResizeObserver fires on every sub-pixel nudge and
         setState on an identical value would loop it against its own layout. */
      const sig = JSON.stringify(next);
      if (sig === last) return;
      last = sig;
      setGeo(next);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    document.fonts?.ready.then(measure).catch(() => {});
    /* The scroll listener is for the safety-valve case only: if a service ever
       outgrows the panel body, its headings move under the anchors. */
    const body = stage.querySelector('[data-flow-panel][data-open="true"] [data-flow-scroll]');
    body?.addEventListener("scroll", measure, { passive: true });
    return () => {
      alive = false;
      ro.disconnect();
      body?.removeEventListener("scroll", measure);
    };
  }, [eco.active, eco.engaged, dense]);

  const activeCap = CAPABILITIES[eco.active];
  const techCount = activeCap.stack.reduce((n, g) => n + g.items.length, 0);

  return (
    <>
      <div
        ref={stageRef}
        /* hidden lg:block — the breakpoint is on the STAGE, never on a
           [data-reveal] node (house rule 6 / rule 3). */
        className="eco-stage relative mx-auto hidden w-full max-w-[1280px] lg:block"
        style={{ height: STAGE_H }}
        {...eco.stageProps}
      >
        {/* ---- the links ------------------------------------------------
            Under the nodes, pointer-transparent, a pixel-for-pixel viewBox so
            a bezier lands exactly on the box it was measured from. */}
        {geo && (
          <svg
            viewBox={`0 0 ${geo.w} ${geo.h}`}
            className="pointer-events-none absolute inset-0 size-full"
            aria-hidden="true"
            fill="none"
          >
            {/* Core → service. `.eco-line` is the shared draw-on-reveal from
                globals.css: pathLength-normalised dash, released by
                `[data-reveal].is-in`, and switched off under reduced motion by
                the same stylesheet. Reused rather than re-implemented so this
                variant's lines behave identically to the radial ones'. */}
            {geo.core.map((e, i) => (
              <path
                key={`c${i}`}
                d={e.d}
                pathLength={1}
                data-on={i === eco.active ? "true" : "false"}
                className="eco-line stroke-accent"
                strokeWidth={1.5}
                style={{ "--d": `${e.delay}ms` } as React.CSSProperties}
              />
            ))}
            {/* Service → group → technology. These are re-measured on every
                selection, so they animate with `phase` instead: the branch
                redraws itself outward each time the columns move. */}
            {geo.branch.map((e, i) => (
              <path
                key={`b${i}`}
                d={e.d}
                pathLength={1}
                /* `eco-line` + `data-travel` so the travelling dash reaches the
                   branch too, not just the core edge - these are the segments
                   that carry the eye out to the last technology. The inline
                   dash is dropped once the branch has drawn, because an inline
                   style outranks the class and would freeze the animation. */
                className="eco-line stroke-accent"
                data-travel={phase ? "true" : undefined}
                strokeWidth={1.25}
                style={{
                  ...(phase ? {} : { strokeDasharray: 1, strokeDashoffset: 1 }),
                  opacity: phase ? 0.45 : 0,
                  transition: `stroke-dashoffset .5s cubic-bezier(.16,1,.3,1) ${
                    reduced ? 0 : e.delay
                  }ms, opacity .3s ${reduced ? 0 : e.delay}ms`,
                }}
              />
            ))}

            {/* The dots. Second pass, above every edge - the core link and
                then each branch segment out to the last technology. */}
            {/* ALL SIX, not just the active one: the core column feeds
                every service at rest, and gating this on the selection left
                five of the six links dead until the pointer arrived. */}
            {geo.core.map((e, i) => (
              <DotEdge key={`cdot${i}`} d={e.d} />
            ))}
            {phase &&
              geo.branch.map((e, i) => (
                <DotEdge key={`bdot${i}`} d={e.d} />
              ))}
          </svg>
        )}

        <div
          className="relative z-10 grid h-full"
          style={{
            gridTemplateColumns: `${CORE_COL}px ${SVC_COL}px minmax(0,1fr)`,
            columnGap: GUTTER,
          }}
        >
          {/* ---- column 1 · the core --------------------------------- */}
          <div className="flex h-full flex-col">
            <ColHead>Core</ColHead>
            <div data-flow-core className="relative flex-1">
              <Core />
            </div>
          </div>

          {/* ---- column 2 · the six services -------------------------- */}
          <div className="flex h-full flex-col">
            <ColHead>Services</ColHead>
            <div
              role="tablist"
              aria-label="Interloid services"
              aria-orientation="vertical"
              className="flex flex-1 flex-col justify-center gap-3"
            >
              {CAPABILITIES.map((c, i) => {
                const h = HUE[c.hue];
                const current = i === eco.active;
                const n = c.stack.reduce((t, g) => t + g.items.length, 0);
                return (
                  <button
                    key={c.k}
                    type="button"
                    {...eco.nodeProps(i)}
                    data-flow-node
                    data-flow-svc
                    data-active={current ? "true" : "false"}
                    className={`group flex h-[68px] w-full items-center gap-3 rounded-2xl border px-3 text-left outline-none transition-[background-color,border-color,box-shadow,transform] duration-300 focus-visible:ring-2 focus-visible:ring-accent ${
                      current
                        ? `translate-x-1 border-border bg-card shadow-sm ring-1 ${h.ring}`
                        : "border-transparent bg-transparent hover:border-border hover:bg-card"
                    }`}
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-xl border border-border shadow-sm transition-colors duration-300 ${
                        /* The filled tile is reserved for a DELIBERATE
                           selection. At rest the first service is merely
                           "showing" — soft tile, no fill — so the first hover
                           or key press visibly hands control over, and the
                           resting picture stays calm. */
                        current && eco.engaged ? `${h.tile} text-white` : `${h.soft} ${h.text}`
                      }`}
                    >
                      <Icon name={c.icon} className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-[15px] font-bold leading-[1.25] tracking-[-0.01em] text-foreground">
                        {c.name}
                      </span>
                      <span className="mt-0.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                        {c.stack.length} groups · {n} tech
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ---- columns 3 and 4 · the open service's subtree ----------
              All six panels are mounted and stacked, and only the open one is
              opaque. Never a conditional render: Reveal.tsx observes
              [data-reveal] once on mount, and a panel created later by a state
              change would never be observed. Nothing inside a panel is
              focusable, so opacity + pointer-events-none is enough to take a
              closed one out of reach; panelProps supplies the aria-hidden. */}
          <div className="relative h-full min-h-0">
            {CAPABILITIES.map((c, i) => {
              const open = i === eco.active;
              const h = HUE[c.hue];
              const n = c.stack.reduce((t, g) => t + g.items.length, 0);
              return (
                <div
                  key={c.k}
                  {...eco.panelProps(i)}
                  data-flow-panel
                  data-open={open ? "true" : "false"}
                  className={`absolute inset-0 flex flex-col ${
                    open ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                  style={{ transition: "opacity .28s ease-out" }}
                >
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: `${GROUP_COL}px minmax(0,1fr)`,
                      columnGap: GUTTER,
                    }}
                  >
                    <ColHead>Groups · {c.stack.length}</ColHead>
                    <ColHead>Technologies · {n}</ColHead>
                  </div>

                  {/* min-h-full inside the scroller is the safe-centring
                      pattern: content shorter than the column is centred,
                      content taller grows the flex box instead of being
                      clipped at the top the way `align-content:center` on an
                      overflowing grid would. */}
                  <div data-flow-scroll className="min-h-0 flex-1 overflow-y-auto">
                    <div className="flex min-h-full flex-col justify-center">
                      <div
                        className="grid items-center"
                        style={{
                          gridTemplateColumns: `${GROUP_COL}px minmax(0,1fr)`,
                          columnGap: GUTTER,
                          rowGap: 16,
                        }}
                      >
                        {c.stack.map((g, gi) => {
                          /* One grid ROW per group, so the group and the marks
                             it labels are vertically aligned by the layout
                             itself. That is what keeps the level-2 → level-3
                             link a short, almost-horizontal curve instead of a
                             long diagonal across the column. */
                          const slide = {
                            opacity: open && phase ? 1 : 0,
                            transform: open && phase ? "none" : "translateX(-10px)",
                            transition: `opacity .3s ease-out ${
                              reduced ? 0 : 60 + gi * 55
                            }ms, transform .4s cubic-bezier(.16,1,.3,1) ${
                              reduced ? 0 : 60 + gi * 55
                            }ms`,
                          } as React.CSSProperties;
                          return (
                            <div key={g.group} className="contents">
                              <div
                                data-flow-node
                                data-flow-grp
                                className={`flex items-center gap-2.5 self-center rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm ring-1 ${h.ring}`}
                                style={slide}
                              >
                                <span className={`size-2 shrink-0 rounded-full ${h.tile}`} />
                                <span
                                  className={`text-[11px] font-bold uppercase leading-[1.35] tracking-[0.1em] ${h.text}`}
                                >
                                  {g.group}
                                </span>
                                <span className="ml-auto shrink-0 text-[10px] font-bold text-muted-foreground">
                                  {g.items.length}
                                </span>
                              </div>

                              <div
                                data-flow-tech
                                /* Two chip columns at lg, three from xl. A chip
                                   spends 60px on its plate, gap and padding, so
                                   the name gets the rest: ~120px in the 180px
                                   columns from 1280 up, ~90px in the 150px
                                   columns at exactly lg — where the three
                                   longest names ("Android Studio",
                                   "Ruby on Rails", "GitHub Actions") take a
                                   second line rather than being truncated.
                                   Measured at 1024, 1440 and 1920. */
                                className={
                                  dense
                                    ? "flex flex-wrap items-center gap-2 self-center"
                                    : "grid grid-cols-2 gap-2 self-center xl:grid-cols-3"
                                }
                                style={slide}
                              >
                                {g.items.map((t) =>
                                  dense ? (
                                    /* Marks only. The accessible name is on
                                       TechLogo's wrapper, so `dense` hides the
                                       name from the eye, never from a screen
                                       reader. */
                                    <span
                                      key={t.name}
                                      data-flow-node
                                      className="transition-transform duration-300 hover:scale-110"
                                    >
                                      <TechLogo tech={t} size="md" />
                                    </span>
                                  ) : (
                                    <span
                                      key={t.name}
                                      data-flow-node
                                      className="flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-3 transition-colors duration-300 hover:border-accent"
                                    >
                                      <TechLogo tech={t} size="sm" />
                                      <span className="min-w-0 text-[13.5px] font-medium leading-[1.25] text-muted-strong">
                                        {t.name}
                                      </span>
                                    </span>
                                  ),
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* The columns swap silently otherwise: a keyboard user arrowing down
            the service list hears only the tab names, never what opened. One
            polite status line names it and its size — not its contents, which
            as a live region would re-announce every technology per keypress. */}
        <p role="status" aria-live="polite" className="sr-only">
          {activeCap.name}: {activeCap.stack.length} groups, {techCount} technologies.
        </p>
      </div>

      <EcosystemList capabilities={CAPABILITIES} idPrefix={idPrefix} />
    </>
  );
}

/* The column caption. A fixed height on every one of the four is what keeps
   the four column BODIES on a shared baseline — the panel's two captions live
   inside the panel, so they have to agree with the two outside it. */
function ColHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-9 shrink-0 items-end border-b border-hairline pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </div>
  );
}
