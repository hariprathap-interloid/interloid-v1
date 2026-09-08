"use client";

import Icon from "../../Icon";
import TechLogo from "../TechLogo";
import type { Capability, Tech } from "@/content/service";
import { HUE } from "@/content/site";
import { polarUnits, RINGS, STAGE, trim } from "./geometry";

/* Shared furniture for the three ecosystem variants. Everything here is
   layout-agnostic: the variants decide WHERE things go, these decide what
   they look like, so the three prototypes stay visually identical and the
   comparison is about layout rather than styling. */

/* ── THE BACKDROP ─────────────────────────────────────────────────────────
   Rings and connectors, in one SVG under the HTML nodes. SVG for these two
   because a circle and a line are what SVG is for; everything else is HTML,
   because the technology marks are <img> on white plates and cannot live
   inside the SVG.

   THE [data-reveal] IS NOT ON THIS SVG, AND MUST NOT BE. The stage is
   `hidden lg:block`, so below the breakpoint this element has no box and an
   IntersectionObserver never fires for it — it would sit unrevealed forever
   and fail a reveal audit at 390 and 768 (measured: one stuck node at both).
   The observed ancestor is the wrapper in EcosystemSection, which is
   displayed at every width; `[data-reveal].is-in .eco-line` in globals.css
   reaches these lines from there and releases the dash. No ids and no <defs>: these components render twice on the
   page (desktop stage + mobile list), and a duplicated id resolves to
   whichever came first. */
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
          /* The reference fades its rings outward — 0.6, 0.4, then lightest.
             Ours does the same so the outer ring reads as the edge of the
             system rather than as a box around it. */
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
          /* Staggered so the six lines draw outward in sequence rather than
             all at once — the reference's own stagger, and it is what makes
             the map read as growing from the core. */
          style={{ "--d": `${120 + i * 90}ms` } as React.CSSProperties}
        />
      ))}

      {/* THE FLOW, and where it starts.

          AT REST all six spokes carry beads, so the map is alive the moment
          it scrolls in — a diagram that only moves under a pointer looks
          broken to a reader who has not touched it yet.

          ONCE A SERVICE IS OPEN only its own spoke does. Six streams plus an
          opened branch is six streams too many: the reader has just asked a
          question and the answer should be the only thing moving, running out
          of the core, through the service, into its groups and marks. The
          five idle spokes going at the same time made the branch one more
          animation among seven rather than the subject.

          A second pass, after the lines, so a bead is never painted under the
          edge it rides. Every Backdrop variant gets this for free. */}
      {nodes.map((n, i) =>
        engaged && i !== activeIndex ? null : (
          <DotEdge key={`bead${i}`} x1={c} y1={c} x2={n.x} y2={n.y} />
        ),
      )}
    </svg>
  );
}

/* ── THE LINKS ────────────────────────────────────────────────────────────
   Edges between the levels, in stage units, drawn under the nodes.

   This is what turns a scatter of badges into a TREE. The first build drew
   connectors only from the core to the six services and left the group pills
   and the technology marks floating at their radii - so "Databases" and its
   four marks were near each other but nothing said they belonged together,
   and the eye had to infer the hierarchy from proximity alone. Every level is
   joined to its parent now.

   Same dash-release as the service connectors: `pathLength=1` with the offset
   let go by `[data-reveal].is-in`, so a branch DRAWS itself outward from the
   service when it opens, in the order core to group to mark. */
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

      {/* A SECOND PASS, so every bead paints above every edge. Emitted inside
          the first map they would be overdrawn by any edge that came later.

          DEPTH 0 IS SKIPPED. The core→service leg is drawn and beaded by
          Backdrop already, always — dotting it here as well would run a
          second identical stream exactly on top of the first, in phase, for
          no visible gain. Levels 2 and 3 only exist while a branch is open,
          so those are the ones this pass is for. */}
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
   Three dots ride every edge, continuously, from the moment the diagram
   reveals - see `.eco-dot` in globals.css, which owns the flow. This owns
   what one of them LOOKS like, and it is a RING, not a solid dot:

     glow   12px of accent at 15%, blurred - the light around the bead
     ring  6.5px of brand                 - the ink value, unblurred
     hole  2.5px of the page background   - punches the middle back out

   CALMED, twice over. The first sizing (17/9/3.5 with the glow at 28% and an
   8px blur) read as the brightest thing on the stage: a bead is an annotation
   on an edge and it was out-weighing the nodes the edges join. The rule is
   that the bead must be smaller than the smallest thing it travels between -
   a 48px mark plate is 25 units of half-width, and 12 units of bead is half
   of that.

   Painted widest first, each layer over the middle of the one before it, so
   three strokes on one geometry make a donut. That is the reference's own
   construction and it is why the bead reads at 8px: a solid dot of any colour
   is a blob at that size, while a ring has an inside and an outside and the
   eye resolves it as an object. The hole is the BACKGROUND token, not white -
   the section is `bg-background`, and white would be a bright pip in dark
   mode instead of a hole.

   The glow and the ring cannot be the same layer: filtering the ring fogs the
   very edge it exists to draw, and an unblurred glow is just a fatter dot.

   NO DELAY, and no `depth`. Every bead in the diagram shares one phase, which
   is what makes a dot arrive at a node in the same instant one leaves it. See
   the handoff note on `@keyframes eco-travel`.

   `d` for paths, or the four coordinates for a straight line - the variants
   draw both kinds and neither should have to know how the bead is built. */
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
   The hub. Deliberately quiet: it is the thing everything else hangs off,
   and the reference's core is a soft white disc rather than a loud badge. */
export function Core({ label = "Interloid" }: { label?: string }) {
  /* 116px, NOT 136. The core is a fixed CSS size while the orbits are a
     percentage of a stage that changes width, so the two are only safe
     together at the SMALLEST stage the wheel is used at. Measured: with a
     136px core (68px radius) the closed services, which sit at 0.62 of their
     radius, had their inner edge at 66.6px - the diagram shipped with a node
     through the middle of its own hub. My overlap harness never caught it
     because it only compared nodes with other nodes, and the core is neither.
     116px leaves 8.6px of daylight at the tightest stage. */
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
   Icon tile with the label pill BENEATH it, as measured on the reference.
   The button is the whole node so the hit target includes the label. */
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
      /* THE BUTTON IS EXACTLY THE ICON, 56x56, AND NOTHING ELSE.

         The label used to sit inside it in normal flow, which made every node
         a 132x90 box. Six of those on a wheel whose radius is only ~100px on
         the narrower variant collided with each other, and on the radial
         variants the tall box reached out and touched the group ring - two
         separate overlap failures with one cause. The label is now absolutely
         positioned beneath, so it paints without occupying layout and the
         geometry only ever has to clear a 56px square. It is also
         pointer-events-none, so a wide label cannot swallow the hover
         intended for the node beside it. */
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
      {/* THE LABEL IS THE COLLISION. At rest every service is labelled, which
          is the reference picture. But a 132px label pill on a node that has
          been pulled toward the core sits on top of its neighbour - measured,
          six colliding pairs before this was added. So closed nodes drop to
          their icon, which also focuses attention on the open branch. The name
          is not lost: it stays the button's accessible name below. */}
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
  /** Recede WITHOUT going translucent.

      A dimmed pill used to be given a low inline opacity, which let every
      connector behind it show straight through the label - the struck-through
      look the user reported, arriving by a second route after the tint was
      fixed. Opacity cannot dim a label and keep it opaque at the same time.
      This drops the hue instead: same solid ground, quieter ink and ring. */
  dim?: boolean;
}) {
  const h = HUE[hue];
  return (
    /* `bg-card`, NOT `h.soft`. The tint was 10% opaque, so every connector
       drawn beneath a group pill showed through the label and the whole
       diagram looked struck through. The hue survives in the ring and the
       text; only the ground is now solid. */
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

/* ── A TECHNOLOGY (level 3) ───────────────────────────────────────────────
   The plate is TechLogo, which already solves the two hard parts: a white
   plate in both themes (brand hexes go unreadable on the dark card) and a
   monogram for the ten technologies with no mark in the icon set. The name
   is a hover/focus tooltip rather than always-on text, because at this
   radius forty-odd labels would collide — the accessible name is on the
   plate itself, so nothing is hidden from assistive tech. */
export function TechNode({
  tech,
  style,
  delay,
}: {
  tech: Tech;
  style: React.CSSProperties;
  delay: number;
}) {
  return (
    <span
      className="eco-grow group/tech absolute"
      style={{ ...style, "--d": `${delay}ms` } as React.CSSProperties}
    >
      <span className="block transition-transform duration-300 group-hover/tech:scale-110">
        <TechLogo tech={tech} size="md" shape="circle" />
      </span>
      <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-[10px] font-semibold text-foreground opacity-0 shadow-md transition-opacity duration-200 group-hover/tech:opacity-100">
        {tech.name}
      </span>
    </span>
  );
}

/* ── THE READABLE FALLBACK ────────────────────────────────────────────────
   Below `lg` there is no radial map. A 900px wheel does not survive a 390px
   screen by scaling — the labels become unreadable and the technology plates
   collide — so the small screen gets a different composition with the SAME
   information: the six services as a list, each opening onto its groups and
   marks. This is also what a screen reader gets on every viewport, because
   it is real DOM in reading order rather than a positioned diagram. */
export function EcosystemList({
  capabilities,
  idPrefix,
}: {
  capabilities: readonly Capability[];
  idPrefix: string;
}) {
  return (
    <ul className="flex flex-col gap-4 lg:hidden">
      {capabilities.map((c) => {
        const h = HUE[c.hue];
        return (
          <li
            key={c.k}
            className="rounded-[1.25rem] border border-border bg-card p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-3">
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-xl text-white shadow-sm ${h.tile}`}
              >
                <Icon name={c.icon} className="size-5" />
              </span>
              <h3 className="font-display text-[15px] font-bold leading-[1.3] tracking-[-0.015em] text-foreground">
                {c.name}
              </h3>
            </div>
            <div className="flex flex-col gap-4">
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
