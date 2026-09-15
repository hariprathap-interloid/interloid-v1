"use client";

import TechLogo from "../TechLogo";
import { CAPABILITIES, type Capability, type Tech } from "@/content/service";
import { HUE } from "@/content/site";
import {
  Backdrop,
  Core,
  EcosystemList,
  GroupPill,
  Links,
  ServiceNode,
  connectorPoints,
} from "./parts";
import EcosystemSphere from "./EcosystemSphere";
import {
  CLOSED_SERVICE_FACTOR,
  SERVICE_ANGLES,
  SERVICE_RADII,
  STAGE,
  fan,
  polar,
  polarUnits,
  type Point,
} from "./geometry";
import { useEcosystem } from "./useEcosystem";

/* ==========================================================================
   ECOSYSTEM CONSTELLATION — the desktop (`lg`+) three-level stack map.
   ==========================================================================
   Resting state: six labelled services on alternating radii, faint rings,
   and core connectors drawn on by the reveal observer. `eco.engaged` stays
   false until the visitor hovers, focuses or taps.

   Open state: the selected service's tree, with every level joined to its
   parent by a real edge (core → service → group → technology) drawn with
   <Links>. Technology marks are 48px `TechLogo size="lg"` plates so a mark
   alone can name its technology. The branch draws itself outward in
   sequence, staged by each edge's `d` and each node's `delay`; a node always
   appears slightly before the edge that reaches it.

   ── GEOMETRY INVARIANTS ──────────────────────────────────────────────────
   All clearances are in stage units (STAGE = 1000 across the stage).

   1. The stage is capped at 960px, the widest size that is the same at every
      `lg` viewport. Plate size in stage units is 48000 / stageWidth, so a
      stage that shrank at the breakpoint would invalidate every clearance.
      At 960 a plate is 50 units.

   2. OPEN_R is bounded by the open service's label pill, which hangs radially
      outward of its node and is the largest box on the map. Too small and the
      label reaches the core or the retreated neighbours; too large and it
      reaches the group ring.

   3. The branch sector (SECTOR_D) may be wide because the
      retreated services sit well inside the group ring.

   4. Group radii are assigned by distance from the service's axis, not by
      index: the groups nearest the axis take the outer radius, because the
      label hangs out along the axis and would otherwise sit on them.

   5. Marks are placed relative to their group centre on two alternating
      radii (MARK_RADII) driven by a counter that runs across the whole
      service, so the tightest pair — the two marks either side of a gutter
      between groups — always land on different radii.

   The stage is square at up to 960px: a tall section is the cost of 48px
   plates on a radial layout.
   ========================================================================== */

/* Where the open service sits — bounded by its label pill (invariant 2). */
const OPEN_R = 186;

/* Level 2. Index 0 is the outer radius, given to the groups nearest the
   service's own axis (invariant 4) — not `groupIndex % 2`. */
const L2_RADII = [298, 246] as const;

/* Level 3, measured from the group centre, not the stage centre.

   The inner ring must clear the widest group node's half-width plus half a
   mark plate. The outer ring is capped by the stage: outer L2 radius + outer
   mark radius + a plate half must stay inside the 500-unit half-stage, so
   L2_RADII and MARK_RADII cannot be chosen independently.

   Alternating rings separate consecutive marks radially as well as
   angularly. */
const MARK_RADII = [118, 164] as const;

/* How wide a group's fan opens, by item count. It grows with the count so a
   large group does not overlap itself, and is capped so the outermost marks
   stay outward of the group rather than level with it. Adjacent group
   centres are far enough apart that neighbouring fans stay clear. */
const MARK_SPREAD_STEP = 40;
const MARK_SPREAD_MAX = 120;

/* The angle the open branch owns. The retreated services sit well inside
   the group ring, so the branch may take a wide sector
   (invariant 3). */
const SECTOR_D = 172;

/* Half a mark plate, in stage units, plus 3px of air: where a group→mark
   edge stops so it does not run under the plate. */
const MARK_STOP = 28;

type Mark = {
  tech: Tech;
  /** Absolute, in stage units. Level 3 is positioned relative to its group,
      so a polar pair measured from the stage centre no longer describes it. */
  at: Point;
  /** Bearing out of the group centre, so an edge can stop short of the
      plate along the line it actually travels. */
  bearing: number;
};
type BranchGroup = {
  label: string;
  angle: number;
  radius: number;
  /** The group centre in stage units — one source for the pill, its marks
      and every edge that touches either. */
  at: Point;
  marks: Mark[];
};

/** `r` units from `from`, at `deg`. The local counterpart of polarUnits, for
    everything that hangs off a node rather than off the stage centre. */
function offset(from: Point, r: number, deg: number): Point {
  const rad = (deg * Math.PI) / 180;
  return { x: from.x + r * Math.cos(rad), y: from.y + r * Math.sin(rad) };
}

/** Stage units → the percentage pair the absolutely-positioned nodes take. */
function unitsToPct(p: Point): Point {
  return { x: (p.x / STAGE) * 100, y: (p.y / STAGE) * 100 };
}

/** The whole open-state layout for one service, in one place, so the nodes
    and the edges that join them can never be computed from two different
    ideas of where things are. */
function branchLayout(cap: Capability, serviceAngle: number): BranchGroup[] {
  const n = cap.stack.length;
  const slice = SECTOR_D / n;
  /* Runs across every mark of the service, not per group (invariant 5). */
  let seq = 0;
  return cap.stack.map((g, gi) => {
    const centre = serviceAngle - SECTOR_D / 2 + slice * (gi + 0.5);
    /* The group sits exactly inward of the marks it labels.

       Its radius depends on distance from the service's axis, in symmetric
       pairs, so the assignment mirrors about that axis (invariant 4).
       `Math.round` is there because (gi - mid) is a half-integer for an even
       group count. */
    const band = Math.floor(Math.round(Math.abs(gi - (n - 1) / 2) * 2) / 2);
    const radius = L2_RADII[band % 2];
    const at = polarUnits(radius, centre);

    /* The fan opens around the group's own outward bearing, so the cluster
       reads as belonging to it. */
    const spread = Math.min(
      MARK_SPREAD_MAX,
      MARK_SPREAD_STEP * (g.items.length - 1),
    );
    const angles = fan(centre, g.items.length, spread);
    const marks = g.items.map((t, ti) => {
      const bearing = angles[ti];
      const m = {
        tech: t,
        at: offset(at, MARK_RADII[seq % 2], bearing),
        bearing,
      };
      seq += 1;
      return m;
    });

    return { label: g.group, angle: centre, radius, at, marks };
  });
}

/** Every edge of one service's tree, in stage units, with the delay that
    stages the draw. Core → service → group → technology, in that order, so
    the `d` values are monotonic and the branch grows outward. */
function branchEdges(groups: BranchGroup[], serviceAngle: number) {
  const edges: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    d: number;
    depth: number;
  }[] = [];

  /* 1 — the spine. Starts at 64 units, just outside the 116px core at a
     960px stage, and stops 30 units short of the node centre so it meets the
     tile's edge rather than crossing it. */
  const a = polarUnits(64, serviceAngle);
  const b = polarUnits(OPEN_R - 30, serviceAngle);
  edges.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, d: 0, depth: 0 });

  /* 2 — service → group. Every edge leaves the node's centre, hidden under
     the 56px tile (the Links SVG is painted before the tablist). */
  const hub = polarUnits(OPEN_R, serviceAngle);
  groups.forEach((g, gi) => {
    const gin = polarUnits(g.radius - 18, g.angle);
    edges.push({
      x1: hub.x,
      y1: hub.y,
      x2: gin.x,
      y2: gin.y,
      d: 250 + gi * 55,
      depth: 1,
    });

    /* 3 — group → technology. Every edge leaves the group's centre (hidden
       under the group node) and fans out to its own mark. Each stops
       MARK_STOP short along its own bearing, since marks are placed relative
       to the group and the fan has no single shared direction. */
    g.marks.forEach((m, ti) => {
      const mp = offset(m.at, -MARK_STOP, m.bearing);
      edges.push({
        x1: g.at.x,
        y1: g.at.y,
        x2: mp.x,
        y2: mp.y,
        d: 400 + gi * 55 + ti * 28,
        depth: 2,
      });
    });
  });

  return edges;
}

/* ── A TECHNOLOGY (level 3), LARGE ────────────────────────────────────────
   A technology plate with a large mark: `eco-grow` for the
   staged fade-and-rise, `--d` for the stagger, the name as a hover tooltip,
   and the accessible name on the plate itself.

   The hue ring is a second grouping cue after the edges. `ring-2` paints
   outside the border box without changing layout size, so the clearances
   above hold on the unringed 50-unit plate. */
function MarkNode({
  tech,
  hue,
  style,
  delay,
}: {
  tech: Tech;
  hue: Capability["hue"];
  style: React.CSSProperties;
  delay: number;
}) {
  const h = HUE[hue];
  return (
    <span
      className="eco-grow group/mark absolute"
      style={{ ...style, "--d": `${delay}ms` } as React.CSSProperties}
    >
      <span
        className={`block rounded-xl shadow-[0_12px_30px_-14px_rgba(15,23,42,.5)] ring-2 transition-transform duration-300 group-hover/mark:scale-110 ${h.ring}`}
      >
        <TechLogo tech={tech} size="lg" />
      </span>
      <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-[11px] font-semibold text-foreground opacity-0 shadow-md transition-opacity duration-200 group-hover/mark:opacity-100">
        {tech.name}
      </span>
    </span>
  );
}

export default function EcosystemConstellation({
  idPrefix = "constellation",
}: {
  idPrefix?: string;
}) {
  /* `true`: service nodes move when a branch opens, so a node can slide
     under a resting pointer and fire a mouseenter that steals the selection.
     See `guardMovingLayout` in useEcosystem. */
  const eco = useEcosystem(idPrefix, true);

  /* Each service's current radius. At rest: its alternating radius. Once
     engaged: the open one moves to OPEN_R so its branch always starts the
     same distance from the core, and the others retreat so the branch may
     borrow their angle. */
  const radiiNow = SERVICE_RADII.map((r, i) =>
    !eco.engaged
      ? r
      : i === eco.active
        ? OPEN_R
        : r * CLOSED_SERVICE_FACTOR,
  );
  /* The core connectors follow the nodes but snap rather than transition: a
     <line>'s x1/y1/x2/y2 are attributes, not CSS properties. Snapping on a
     faint line beneath everything beats connectors pointing at stale
     positions. */
  const points = connectorPoints(radiiNow, SERVICE_ANGLES);

  const activeCap = CAPABILITIES[eco.active];
  const techCount = activeCap.stack.reduce((n, g) => n + g.items.length, 0);

  return (
    <>
      <div
        /* 960px cap — see invariant 1. `hidden lg:block` is on the stage,
           never on a [data-reveal] element: the reveal script observes once
           on mount and a display:none element never intersects. */
        className="eco-stage relative mx-auto hidden aspect-square w-full max-w-[960px] lg:block"
        {...eco.stageProps}
      >
        <Backdrop
          nodes={points}
          activeIndex={eco.active}
          engaged={eco.engaged}
        />

        {/* ---- the edges ------------------------------------------------
            Painted BEFORE the core and the nodes, so every line ends under
            the thing it points at rather than over it. All are always
            mounted and only the open one is drawn — never a conditional
            render around revealed content (the reveal observes once). */}
        {CAPABILITIES.map((c, i) => {
          const angle = SERVICE_ANGLES[i];
          const groups = branchLayout(c, angle);
          return (
            <Links
              key={c.k}
              edges={branchEdges(groups, angle)}
              open={eco.engaged && i === eco.active}
            />
          );
        })}

        <Core />

        {/* ---- level 1 ------------------------------------------------- */}
        {/* `absolute inset-0`, NOT `contents`: a role on a display:contents
            element is a known a11y-tree hazard. pointer-events-none on the
            wrapper so it cannot swallow hovers meant for the stage. */}
        <div
          role="tablist"
          aria-label="Interloid services"
          aria-orientation="horizontal"
          className="pointer-events-none absolute inset-0 [&>*]:pointer-events-auto"
        >
          {CAPABILITIES.map((c, i) => {
            const isActive = i === eco.active;
            const p = polar(radiiNow[i], SERVICE_ANGLES[i]);
            return (
              <ServiceNode
                key={c.k}
                capability={c}
                index={i}
                active={isActive}
                closed={eco.engaged && !isActive}
                nodeProps={eco.nodeProps(i)}
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  transition:
                    "left .45s cubic-bezier(.16,1,.3,1), top .45s cubic-bezier(.16,1,.3,1), opacity .3s",
                }}
              />
            );
          })}
        </div>

        {/* ---- levels 2 and 3 ------------------------------------------ */}
        {CAPABILITIES.map((c, i) => {
          const open = eco.engaged && i === eco.active;
          const groups = branchLayout(c, SERVICE_ANGLES[i]);
          return (
            <div
              key={c.k}
              {...eco.panelProps(i)}
              data-open={open ? "true" : "false"}
              className="eco-branch contents"
            >
              {groups.map((g, gi) => {
                const gp = polar(g.radius, g.angle);
                return (
                  <div key={g.label} className="contents">
                    <GroupPill
                      label={g.label}
                      hue={c.hue}
                      /* Appears before its own edge, so a connector always
                          arrives at something already there. Same at level
                          3; the branch settles inside a second. */
                      delay={open ? 180 + gi * 55 : 0}
                      style={{ left: `${gp.x}%`, top: `${gp.y}%` }}
                    />
                    {g.marks.map((m, ti) => {
                      const mp = unitsToPct(m.at);
                      return (
                        <MarkNode
                          key={`${g.label}-${m.tech.name}`}
                          tech={m.tech}
                          hue={c.hue}
                          delay={open ? 330 + gi * 55 + ti * 28 : 0}
                          style={{ left: `${mp.x}%`, top: `${mp.y}%` }}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* The panel swap is silent to a screen reader — the tabpanel's
            contents change but nothing announces it. One polite status line
            names what opened and how big it is; the marks themselves are
            readable in the list below on every viewport. */}
        <p role="status" aria-live="polite" className="sr-only">
          {activeCap.name}: {activeCap.stack.length} groups, {techCount}{" "}
          technologies.
        </p>
      </div>

      {/* Below `lg`: the sphere for the sense of scale, then the accordion
          for the content. Both are hidden at `lg`, where the map above takes
          over. The sphere is decoration (aria-hidden); every mark in it is a
          named chip in the accordion. */}
      <EcosystemSphere />
      <EcosystemList capabilities={CAPABILITIES} idPrefix={idPrefix} />
    </>
  );
}
