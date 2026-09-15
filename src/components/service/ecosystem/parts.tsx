"use client";

import { useState } from "react";
import Icon from "../../Icon";
import TechLogo from "../TechLogo";
import type { Capability } from "@/content/service";
import { HUE } from "@/content/site";
import { polarUnits, RINGS, STAGE, trim } from "./geometry";

/* Layout-agnostic building blocks for the ecosystem map: the layout decides
   where things go, these decide what they look like. */

/* ── THE BACKDROP ─────────────────────────────────────────────────────────
   Rings and connectors in one SVG under the HTML nodes. Technology marks are
   <img> plates, so they stay HTML.

   [data-reveal] must not be on this SVG. The stage is `hidden lg:block`, so
   below the breakpoint it has no box and an IntersectionObserver never fires.
   The observed ancestor is the wrapper in EcosystemSection, displayed at every
   width; `[data-reveal].is-in .eco-line` in globals.css reaches these lines
   from there and releases the dash. No ids and no <defs>: a duplicated id
   resolves to whichever came first. */
export function Backdrop({
  nodes,
  activeIndex,
  engaged = false,
}: {
  /** One entry per service: where its connector ends. */
  nodes: { x: number; y: number }[];
  activeIndex: number;
  /** Is a service open? At rest all six spokes flow; once one is open the
      other five stop, so the only thing moving is the chain the reader
      asked for. See the note on the bead pass below. */
  engaged?: boolean;
}) {
  const c = STAGE / 2;
  return (
    <svg
      viewBox={`0 0 ${STAGE} ${STAGE}`}
      className="pointer-events-none absolute inset-0 size-full"
      aria-hidden="true"
      fill="none"
    >
      {RINGS.map((r, i) => (
        <circle
          key={r}
          cx={c}
          cy={c}
          r={r}
          className="stroke-border"
          strokeWidth={1}
          /* Rings fade outward so the outer ring reads as the edge of the
             system rather than a box around it. */
          opacity={0.75 - i * 0.16}
        />
      ))}

      {nodes.map((n, i) => (
        <line
          key={i}
          x1={c}
          y1={c}
          x2={n.x}
          y2={n.y}
          pathLength={1}
          data-on={i === activeIndex ? "true" : "false"}
          className="eco-line stroke-accent"
          strokeWidth={1.5}
          /* Staggered so the lines draw outward in sequence, growing from
             the core. */
          style={{ "--d": `${120 + i * 90}ms` } as React.CSSProperties}
        />
      ))}

      {/* The bead flow. At rest every spoke carries beads so the map is
          alive before interaction; once a service is open only its spoke
          does, so the opened branch is the only thing moving.

          A second pass, after the lines, so a bead is never painted under
          the edge it rides. */}
      {nodes.map((n, i) =>
        engaged && i !== activeIndex ? null : (
          <DotEdge key={`bead${i}`} x1={c} y1={c} x2={n.x} y2={n.y} />
        ),
      )}
    </svg>
  );
}

/* ── THE LINKS ────────────────────────────────────────────────────────────
   Edges between the levels, in stage units, drawn under the nodes, so every
   level is visibly joined to its parent.

   `pathLength=1` with the dash offset released when `open`, so a branch
   draws itself outward — core, then group, then mark — via each edge's `d`
   delay. */
export function Links({
  edges,
  open,
}: {
  /** from-point, to-point, the delay that stages the draw, and optionally how
      far to hold off each end so the line meets the node's edge rather than
      running to its centre (stage units - see geometry.pxToUnits). */
  edges: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    d: number;
    r1?: number;
    r2?: number;
    /** Which hop this edge is: 0 core→service, 1 →group, 2 →technology. */
    depth?: number;
  }[];
  open: boolean;
}) {
  return (
    <svg
      viewBox={`0 0 ${STAGE} ${STAGE}`}
      className="pointer-events-none absolute inset-0 size-full"
      aria-hidden="true"
      fill="none"
    >
      {edges.map((e, i) => {
        const t = trim(e.x1, e.y1, e.x2, e.y2, e.r1 ?? 0, e.r2 ?? 0);
        return (
        <line
          key={i}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          pathLength={1}
          className="stroke-accent"
          strokeWidth={1.25}
          style={{
            strokeDasharray: 1,
            strokeDashoffset: open ? 0 : 1,
            opacity: open ? 0.5 : 0,
            transition: `stroke-dashoffset .5s cubic-bezier(.16,1,.3,1) ${e.d}ms, opacity .3s ${e.d}ms`,
          }}
        />
        );
      })}

      {/* A second pass, so every bead paints above every edge.

          Depth 0 is skipped: Backdrop already beads the core→service leg,
          and a second stream would sit exactly on top of it. */}
      {open &&
        edges
          .filter((e) => (e.depth ?? 1) !== 0)
          .map((e, i) => {
            const t = trim(e.x1, e.y1, e.x2, e.y2, e.r1 ?? 0, e.r2 ?? 0);
            return (
              <DotEdge
                key={`dot${i}`}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
              />
            );
          })}
    </svg>
  );
}

/* ── THE TRAVELLING BEAD ──────────────────────────────────────────────────
   Beads ride every edge continuously once revealed; `.eco-dot` in globals.css
   owns the motion. This owns what a bead looks like — a ring, not a dot:

     glow   12px of accent at 15%, blurred - the light around the bead
     ring  6.5px of brand                 - the ink value, unblurred
     hole  2.5px of the page background   - punches the middle back out

   Painted widest first, so three strokes on one geometry make a donut, which
   reads as an object at small sizes where a solid dot is a blob. The bead
   must stay smaller than the smallest node it travels between. The hole uses
   the background token, not white, so it stays a hole in dark mode. Glow and
   ring are separate layers because blurring the ring would fog its edge.

   No delay: every bead shares one phase, so a dot arrives at a node the
   instant one leaves it.

   Accepts `d` for a path, or four coordinates for a straight line. */
const DOT_LAYERS = [
  { w: 12, cls: "stroke-accent eco-dot-glow", op: 0.15 },
  { w: 6.5, cls: "stroke-brand", op: 1 },
  { w: 2.5, cls: "stroke-background", op: 1 },
];

export function DotEdge({
  d,
  x1,
  y1,
  x2,
  y2,
}: {
  d?: string;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}) {
  return (
    /* The <g> is the reveal gate. Each layer carries its own opacity, so the
       fade-in cannot live on `.eco-dot` without flattening the glow to 1. */
    <g className="eco-train">
      {DOT_LAYERS.map((l) =>
        d ? (
          <path
            key={l.w}
            d={d}
            pathLength={1}
            className={`eco-dot ${l.cls}`}
            strokeWidth={l.w}
            opacity={l.op}
          />
        ) : (
          <line
            key={l.w}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            pathLength={1}
            className={`eco-dot ${l.cls}`}
            strokeWidth={l.w}
            opacity={l.op}
          />
        ),
      )}
    </g>
  );
}

/* ── THE CORE ─────────────────────────────────────────────────────────────
   The hub: deliberately quiet, a soft disc rather than a loud badge. */
export function Core({ label = "Interloid" }: { label?: string }) {
  /* 116px. The core is a fixed CSS size while the orbits scale with the
     stage, so it must clear the retreated services at the smallest stage
     width used. A larger core overlaps them. */
  return (
    <div
      className="absolute left-1/2 top-1/2 z-[2] flex size-[116px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-border bg-card text-center shadow-[0_18px_50px_-18px_rgba(31,93,160,.45)]"
      aria-hidden="true"
    >
      <span
        className="mb-1 grid size-8 place-items-center rounded-xl bg-gradient-to-br from-brand to-accent text-white"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
        >
          <path d="M12 2 2 7l10 5 10-5-10-5Z" />
          <path d="m2 17 10 5 10-5" />
          <path d="m2 12 10 5 10-5" />
        </svg>
      </span>
      <span className="font-display text-[11px] font-bold tracking-[0.08em] text-foreground">
        {label.toUpperCase()}
      </span>
      <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        Core
      </span>
    </div>
  );
}

/* ── A SERVICE (level 1) ──────────────────────────────────────────────────
   Icon tile with the label pill beneath it. */
export function ServiceNode({
  capability,
  index,
  active,
  /** True once a branch is open and this is not it: the node shrinks to its
      icon alone and steps back. */
  closed,
  style,
  nodeProps,
}: {
  capability: Capability;
  index: number;
  active: boolean;
  closed: boolean;
  style: React.CSSProperties;
  nodeProps: Record<string, unknown>;
}) {
  const h = HUE[capability.hue];
  return (
    <button
      type="button"
      {...nodeProps}
      data-active={active ? "true" : "false"}
      /* The button is exactly the 56x56 icon. The label is absolutely
         positioned beneath, so it paints without occupying layout and the
         geometry only has to clear a 56px square. It is pointer-events-none
         so a wide label cannot swallow a hover meant for a neighbour. */
      className={`eco-node group absolute grid size-14 place-items-center rounded-2xl outline-none transition-opacity duration-300 ${
        closed ? "opacity-45" : "opacity-100"
      }`}
      style={{ ...style, "--i": index } as React.CSSProperties}
    >
      <span
        className={`grid size-14 place-items-center rounded-2xl border border-border shadow-sm transition-colors duration-300 ${
          active ? `${h.tile} text-white` : `${h.soft} ${h.text}`
        }`}
      >
        <Icon name={capability.icon} className="size-6" />
      </span>
      {/* Closed nodes hide their label: pulled toward the core, a label pill
          would sit on its neighbour. The name stays the button's accessible
          name via the sr-only span below. */}
      <span
        className={`pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border px-2.5 py-1 text-center text-[11px] font-bold leading-[1.25] tracking-[-0.01em] shadow-sm transition-[opacity,transform] duration-300 ${
          closed ? "scale-90 opacity-0" : "opacity-100"
        } ${
          active
            ? "border-accent/40 bg-card text-foreground"
            : "border-border bg-card text-muted-strong"
        }`}
        aria-hidden={closed}
      >
        {capability.name}
      </span>
      <span className="sr-only">{capability.name}</span>
    </button>
  );
}

/* ── A GROUP (level 2) ────────────────────────────────────────────────── */
export function GroupPill({
  label,
  hue,
  style,
  delay,
  dim = false,
}: {
  label: string;
  hue: Capability["hue"];
  style: React.CSSProperties;
  delay: number;
  /** Recede without going translucent: drops the hue to muted ink and ring
      on the same solid ground. Opacity would let connectors show through. */
  dim?: boolean;
}) {
  const h = HUE[hue];
  return (
    /* Solid `bg-card` ground, not a translucent tint, so connectors beneath
       the pill do not show through the label. The hue lives in ring and text. */
    <span
      className={`eco-grow eco-group absolute whitespace-nowrap rounded-full border border-border bg-card px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] shadow-sm ring-1 transition-colors duration-300 ${
        dim ? "text-muted-foreground ring-border" : `${h.ring} ${h.text}`
      }`}
      style={{ ...style, "--d": `${delay}ms` } as React.CSSProperties}
    >
      {label}
    </span>
  );
}

/* ── THE READABLE FALLBACK ───────────────────────────────────────
   Below `lg` a radial map cannot scale down legibly, so the same information
   is an accordion: each service opens onto its groups and marks. The mark
   count in each header answers "how much is there" while closed. One panel
   open at a time, the first open on load.

   The panel is `invisible` as well as `grid-rows: 0fr`: a collapsed row
   otherwise leaves its chips focusable. 0fr→1fr animates to real height with
   no max-height magic number.

   This is real DOM in reading order, so it is also what a screen reader gets
   below `lg`. Above `lg` the map carries its own tablist and live region. */
export function EcosystemList({
  capabilities,
  idPrefix,
  className = "lg:hidden",
}: {
  capabilities: readonly Capability[];
  idPrefix: string;
  /** Defaults to hiding the list above `lg`, where the map takes over. */
  className?: string;
}) {
  const [open, setOpen] = useState<string | null>(capabilities[0]?.k ?? null);

  return (
    <ul className={`flex flex-col gap-3 ${className}`}>
      {capabilities.map((c) => {
        const h = HUE[c.hue];
        const on = open === c.k;
        const count = c.stack.reduce((n, g) => n + g.items.length, 0);
        return (
          <li
            key={c.k}
            className="overflow-hidden rounded-[1.25rem] border border-border bg-card shadow-sm"
          >
            <h3>
              <button
                type="button"
                aria-expanded={on}
                aria-controls={`${idPrefix}-stack-${c.k}`}
                onClick={() => setOpen(on ? null : c.k)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-sm ${h.tile}`}
                >
                  <Icon name={c.icon} className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[15px] font-bold leading-[1.3] tracking-[-0.015em] text-foreground">
                    {c.name}
                  </span>
                  <span className="block text-[11px] font-semibold text-muted-foreground">
                    {count} technologies
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`grid size-8 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                    on
                      ? "rotate-180 border-accent/40 bg-accent/10 text-accent-strong"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  <Icon name="chevron" className="size-4" />
                </span>
              </button>
            </h3>

            <div
              id={`${idPrefix}-stack-${c.k}`}
              role="region"
              className={`grid transition-all duration-300 ease-[cubic-bezier(.16,1,.3,1)] ${
                on ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="flex flex-col gap-3 px-4 pb-5">
                  {c.stack.map((g) => (
                    <div key={g.group}>
                      <h4 className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        {g.group}
                      </h4>
                      <ul className="flex flex-wrap items-center gap-2">
                        {g.items.map((t) => (
                          <li
                            key={t.name}
                            className="flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-3"
                          >
                            <TechLogo tech={t} size="sm" />
                            <span className="text-[12px] font-medium text-muted-strong">
                              {t.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Shared helper: the connector end points for the six services. */
export function connectorPoints(
  radii: readonly number[],
  angles: readonly number[],
) {
  return angles.map((a, i) => polarUnits(radii[i] * 0.78, a));
}
