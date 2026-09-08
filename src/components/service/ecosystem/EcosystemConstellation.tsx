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
   VARIANT D — CONNECTED CONSTELLATION
   ==========================================================================
   The user's brief, verbatim: "i need this as an initial state and i need a
   3 level not as a badge as same as like the level 2 and other with
   technology icon need to connect that third level".

   So two things are fixed and one thing changes.

   FIXED — the resting picture. Identical to EcosystemBloom: six labelled
   services on their alternating radii (178/240), the four faint rings, and
   the core connectors drawn on by the reveal observer. `eco.engaged` is false
   until the visitor hovers, focuses or taps, and until then nothing else is
   on screen. That is the picture the user pointed at and asked to keep.

   CHANGED — the open state is a TREE THAT IS ACTUALLY DRAWN.

     · every level is joined to its parent by a real edge:
         core → service → group → technology
       drawn with <Links> at endpoints from polarUnits(). Bloom leaves levels
       2 and 3 floating at their radii and lets proximity imply the hierarchy;
       here the hierarchy is stated. A group and its marks read as one cluster
       because four lines leave that pill and end on those four plates.
     · the technology marks are 48px `TechLogo size="lg"` plates, not the 36px
       badges. At 48px the mark is legible enough to do the whole job of
       naming the technology, which is the point of showing logos at all.
     · the branch DRAWS ITSELF OUTWARD in sequence — spine, then the group
       edges, then the pills, then the mark edges, then the plates — staged
       with the `d` on each edge and the `delay` prop on each node.

   ── THE GEOMETRY IS THE WHOLE PROBLEM, AND IT IS DIFFERENT FROM BLOOM'S ───
   A 48px plate is 2.25× the AREA of a 32px one, so none of geometry.ts's
   level-2/level-3 radii survive contact with it. What follows was derived,
   then MEASURED in the browser (see the harness note at the foot of this
   file); every number is load-bearing.

   1. THE STAGE IS 960px, NOT 860. Overlap is decided in stage units, and a
      plate's size in stage units is 48000/stageWidth — a wider stage makes
      the plates *smaller* relative to the orbits. 960 is the largest width
      that is the SAME at every `lg` viewport: at 1024px the section's
      `max-w-7xl px-6` container is 976px, so anything above 976 would shrink
      at the breakpoint and every clearance below would be computed for a
      stage that does not exist there. At 960 the plate is exactly 50 units.

   2. TWO RADII FOR THE MARKS, ALTERNATED ON A RUNNING COUNTER. This is the
      SERVICE_RADII trick applied to level 3, and without it the map does not
      fit. At a single radius the tightest pair is not inside a group — it is
      ACROSS the gutter between two groups, where the last mark of one group
      and the first of the next are 18% of a slice apart: 7.7° for a 4-group
      service, which at r=424 is 57 units between centres for a 50-unit
      plate. Alternating 424/478 makes that pair 81 units apart instead.
      The counter runs across the whole service, not per group, precisely so
      that the pair either side of a gutter always lands on different radii.

   3. THE ACTIVE SERVICE'S LABEL IS THE HARDEST OBJECT ON THE MAP, and it is
      the one no previous variant has ever measured. Bloom cannot see it: a
      ServiceNode's own box is the 56px button, the label pill is absolutely
      positioned INSIDE it, so a box-intersection harness reports the button
      and never the label. It is also the biggest box in play — up to 203px
      wide once the active node's 1.13 scale is applied — and it hangs 33 to
      73 units radially OUTWARD of the node it belongs to.

      That box is what fixes OPEN_R at 186, from both sides:
        · below ~180 it reaches the core. Measured at 145: Mobile's label
          entered the 116px core by 24.8px and Staff Augmentation's by 8.1px,
          because at −30°/210° the pill hangs down and inward. 186 leaves
          14px of daylight on the worst of them.
        · below ~180 it also reaches the RETREATED NEIGHBOURS. Measured at
          145: Backend's label over the Cloud node by 7.4×22.3px, and the
          Cloud node over AI's label by 1.8×22.3px. At 186 the nearest is
          35 units clear.
        · above ~190 it reaches the group ring — see 5.

   4. THE SECTOR IS 172°, NOT 150. The closed services retreat to ≤149 and
      the group ring starts at 262, so the branch can borrow more than
      geometry.ts's SECTOR without touching anything — and 22 extra degrees
      is what pays for the bigger plates in the 4-group services.

   5. THE GROUP RADII ARE ASSIGNED BY DISTANCE FROM THE SERVICE AXIS, NOT BY
      INDEX. geometry.ts alternates on `groupIndex % 2`; here the two groups
      NEAREST the service's own axis take the OUTER radius and the outer
      groups take the inner one. That is the rule that makes 3 above possible:
      the label hangs straight out along the axis, so the pills that sit under
      it are exactly the near-axis ones, and those are the ones lifted to 316.
      Measured with `% 2` at OPEN_R=186, Cloud's "CI/CD & automation" sat on
      the Cloud label. With this rule the same pair is 20 units clear, and the
      4-pill fan is no worse: the two near-axis pills are now both at 316 and
      43° apart, which is 232 units between centres rather than 216.

   6. 108 UNITS BETWEEN THE OUTER PILL AND THE INNER MARK RING (316 → 424).
      A pill is up to ~225 units wide and an odd-numbered group's centre mark
      sits directly outward of it, so for a group pointing horizontally the
      two boxes are separated in x alone. The widest near-horizontal outer
      pill with a centre mark is "Data science" at ~48 units of half-width;
      48+25=73 is the requirement and 108 is what is provided. The very wide
      pills — "Containers & orchestration" — are even-numbered groups whose
      marks flank the axis and clear in y instead.

      424 is also RINGS[3], so the inner half of the mark ring lands exactly
      on the outermost backdrop ring rather than floating past it.

   ── HONEST COST ──────────────────────────────────────────────────────────
   The stage is 960px square. That is a tall section, and it is the price of
   48px plates on a radial layout; there is no arrangement that keeps both.
   ========================================================================== */

/* Where the open service sits. See note 3 — this single number is squeezed
   between the core, the retreated neighbours and the group ring, all by way
   of the active node's label pill. */
const OPEN_R = 186;

/* Level 2. Index 0 is the OUTER radius and it is given to the groups nearest
   the service's own axis — see note 5, this is not `groupIndex % 2`. */
const L2_RADII = [298, 246] as const;

/* Level 3, measured from its GROUP CENTRE and not from the stage centre.

   The inner ring has to clear the WIDEST group node, and that is not the
   100px disc the circle treatment uses (52 units of radius): in pill mode the
   node is a lozenge, and "Node.js ecosystem" is roughly 78 units of
   half-width. Add 25 for the mark plate and 96 was not enough — measured, as
   two overlaps on Backend and Cloud. 118 clears it.

   The outer ring is then capped by the stage: level 2 sits at 298, so
   298 + 164 + 25 = 487 of the 500 available. That is what L2_RADII was pulled
   in for; the two numbers cannot be chosen separately.

   Two rings, alternating on a running counter, so consecutive marks in a fan
   are separated radially as well as angularly and a tight fan still has air
   in it. */
const MARK_RADII = [118, 164] as const;

/* How wide a group's fan opens, by item count. It has to grow with the count
   or a six-item group overlaps itself, and it has to stop growing or the
   outermost marks swing round beside the group instead of out from it — at
   ±60° a mark is level with its own pill and the edge reads as pointing
   nowhere. Adjacent group centres are ~218 units apart, which is what keeps
   two neighbouring fans of this radius clear of each other. */
const MARK_SPREAD_STEP = 40;
const MARK_SPREAD_MAX = 120;

/* The angle the open branch owns. The five retreated services sit inside
   r=178, and nothing of the branch exists inside r=258, so the branch may
   take more than geometry.ts's 150 without reaching them. */
const SECTOR_D = 172;

/* Fraction of a group's slice its marks fill; the remaining 18% is the
   gutter that makes the grouping readable without a divider. */
const FILL = 0.82;

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
    ideas of where things are — the bug geometry.ts's `groupAngles` note
    records ("THIS MUST AGREE WITH techAngles AND ORIGINALLY DID NOT"). */
function branchLayout(cap: Capability, serviceAngle: number): BranchGroup[] {
  const n = cap.stack.length;
  const slice = SECTOR_D / n;
  /* Runs across every mark of the service, not per group: the pair that
     straddles a gutter is the tightest pair on the map, and this is what
     guarantees those two land on different radii. */
  let seq = 0;
  return cap.stack.map((g, gi) => {
    const centre = serviceAngle - SECTOR_D / 2 + slice * (gi + 0.5);
    /* The pill sits exactly inward of the marks it labels. Any other
       arrangement is uninterpretable — a pill leaning over the neighbouring
       group's plates is what the reader will believe.

       Its RADIUS is decided by how far the group is from the service's own
       axis, in symmetric pairs, so the assignment is a mirror image about
       that axis: the innermost pair goes out to 316, the pair beyond it comes
       back to 262, and so on. Note 5 is why. `Math.round` is there because
       (gi - mid) is a half-integer for an even group count. */
    const band = Math.floor(Math.round(Math.abs(gi - (n - 1) / 2) * 2) / 2);
    const radius = L2_RADII[band % 2];
    const at = polarUnits(radius, centre);

    /* The fan opens around the group's OWN outward bearing, which is what
       makes the cluster read as belonging to it. The running counter for the
       two radii spans every mark of the service, not just this group: the
       pair that straddles a gutter is the tightest pair on the map, and this
       is what guarantees those two land on different rings. */
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

  /* 1 — the spine. Starts at 64, just outside the 116px core (58px = 60.4
     units at a 960px stage), and stops 30 units short of the node centre so
     it meets the tile's edge rather than crossing it. */
  const a = polarUnits(64, serviceAngle);
  const b = polarUnits(OPEN_R - 30, serviceAngle);
  edges.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, d: 0, depth: 0 });

  /* 2 — service → group. All four leave the node's own centre, so they are
     hidden under the 56px tile and appear to emanate from it (the Links SVG
     is painted before the tablist, so the tile is over the line ends). */
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

    /* 3 — group → technology. Every edge leaves the group's CENTRE and fans
       out to its own mark, so the cluster reads as one node with children
       rather than as a pill with a spray beside it. The inner end is hidden
       under the group node itself — the Links SVG is painted before the
       nodes — which is the same trick the service→group edges use.

       Each stops MARK_STOP short along ITS OWN bearing, not along a shared
       radius: with the marks placed relative to the group there is no single
       direction the whole fan travels in. */
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

/* ── A TECHNOLOGY (level 3), BIG ──────────────────────────────────────────
   Not parts.tsx's TechNode: that one renders `TechLogo size="sm"` (36px
   plate, 20px mark) and the brief is explicit that level 3 must stop being a
   badge. Everything else is deliberately the same — `eco-grow` for the
   staged fade-and-rise, `--d` for the stagger, the name as a hover/focus
   tooltip with the accessible name on the plate itself, so nothing is
   hidden from assistive tech.

   The hue ring is the second grouping cue after the edges: every plate in a
   branch carries its service's colour, so a plate belongs to a branch even
   when the eye has lost the line it came in on. `ring-2` paints outside the
   border box and does not change the measured rectangle, which is why the
   clearances above are computed on 50 units and hold at 54 painted. */
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
  /* `true`: this variant MOVES its service nodes when a branch opens, so a
     node can slide under a resting pointer and fire a mouseenter that steals
     the selection - including one the keyboard just made. Measured: arrowing
     off a node reverted the selection whenever the mouse was left inside the
     stage. The guard ignores a hover that arrived with no pointer movement.
     See the hook banner. */
  const eco = useEcosystem(idPrefix, true);

  /* Where each service is RIGHT NOW. At rest: its own alternating radius —
     the reference picture. Once engaged: the open one moves in to OPEN_R so
     its branch always starts the same distance from the core, and the other
     five retreat so the branch may borrow their angle. */
  const radiiNow = SERVICE_RADII.map((r, i) =>
    !eco.engaged
      ? r
      : i === eco.active
        ? OPEN_R
        : r * CLOSED_SERVICE_FACTOR,
  );
  /* The faint core connectors follow the nodes. They cannot be transitioned —
     a <line>'s x1/y1/x2/y2 are attributes, not CSS geometry properties, so
     they snap where the nodes slide. Accepted deliberately: the alternative
     is connectors pointing at where a node used to be, which for the
     outer-ring services overshoots the node by 40 units and reads as a
     broken diagram. The snap happens on a 0.35-opacity line underneath
     everything, at the same moment the whole map re-balances. */
  const points = connectorPoints(radiiNow, SERVICE_ANGLES);

  const activeCap = CAPABILITIES[eco.active];
  const techCount = activeCap.stack.reduce((n, g) => n + g.items.length, 0);

  return (
    <>
      <div
        /* 960px — see note 1. `hidden lg:block` is on the STAGE, never on a
           [data-reveal] element: Reveal.tsx observes once on mount and an
           element that is display:none at that moment never fires. */
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
            the thing it points at rather than over it. All six are always
            mounted and only the open one is drawn — never a conditional
            render around revealed content (Reveal observes once). */}
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
                      /* BEFORE its own edge, not after. The edge used to
                          lead by 60ms and the reader saw a line pointing at
                          nothing; a connector should arrive at something
                          that is already there. Same inversion at level 3,
                          and the whole stagger is tighter so the branch still
                          settles inside a second. */
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

      <EcosystemList capabilities={CAPABILITIES} idPrefix={idPrefix} />
    </>
  );
}
