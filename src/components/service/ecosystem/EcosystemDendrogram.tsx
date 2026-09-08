"use client";

import type { Capability, Tech } from "@/content/service";
import { CAPABILITIES } from "@/content/service";
import { HUE } from "@/content/site";
import Icon from "../../Icon";
import {
  Core,
  DotEdge,
  EcosystemList,
  GroupPill,
  ServiceNode,
  TechNode,
} from "./parts";
import { STAGE, polar, polarUnits } from "./geometry";
import { useEcosystem } from "./useEcosystem";

/* ==========================================================================
   VARIANT G — THE GREAT CIRCLE (radial dendrogram)
   ==========================================================================
   Every one of the 6 services, 20 groups and 62 technologies is on screen at
   once, on concentric arcs, all the time. Nothing opens and nothing closes:
   hovering, focusing or tapping a service brightens its wedge and dims the
   other five. The promise is COMPLETENESS; the risk is a hairball, so every
   radius below is solved rather than chosen, and the numbers are in the
   comments beside them.

   ── 1. THE 360° ARE DIVIDED BY TECHNOLOGY COUNT, NOT EVENLY ──────────────
   Six equal 60° wedges would give Backend (12 marks) the same arc as Mobile
   (8), so the dense wedge collides while the sparse one wastes space. Instead
   EVERY MARK OWNS THE SAME ARC and the wedges fall out of that: one angular
   step per mark, plus a fixed gutter at each group boundary and a bigger one
   at each service boundary. Walking the tree once produces both the mark
   angles and the wedge widths.

     62 marks · 14 within-service group boundaries · 6 service boundaries
     62·step + 14·3.0° + 6·8.5° = 360  →  step = 4.3065°

   Measured wedges (ideal = 360·n/62 in brackets):
     Web 61.87° (63.87) · Mobile 48.95° (46.45) · Backend 69.18° (69.68)
     Cloud 64.87° (63.87) · AI 64.87° (63.87) · Staff aug. 50.26° (52.26)
   They differ from the ideal by at most 2.5° because the group gutters are
   charged to the service that owns them, and a 4-group service pays three of
   them. That is the right bias: the service with more groups needs the room.

   ── 2. THE OUTER ARC IS A TWO-LANE BAND, AND IT HAD TO BE ────────────────
   This is the one place the brief's picture and the arithmetic disagree, so
   here is the arithmetic. A technology plate is TechLogo `sm` — 36px, a fixed
   pixel size that does NOT shrink with the stage. Two axis-aligned 36px
   squares clear each other only when their centres are ≥ 36·√2 = 50.9px
   apart (at 45° on the circle, |dx| and |dy| are both d/√2, which is the
   worst case and it does occur). For 62 marks on ONE arc at the step above:

       R = 50.9 / (2·sin(step/2)) = 678px

   The stage is `aspect-square w-full` inside EcosystemSection's
   `max-w-7xl px-6`, so it is 1232px wide at 1440 and at 1920, and 976px wide
   at the `lg` breakpoint where the diagram first appears. The largest radius
   that fits is 598px and 470px. A single arc is short by 12% at the widest
   width and by 31% at the narrowest — it is not close, and no gutter budget
   recovers it.

   So the marks ALTERNATE between two radii, 436 and 484 stage units, exactly
   the trick geometry.ts already uses for SERVICE_RADII and LEVEL_2_RADII.
   Measured clearances at the 976px stage (the binding one — everything is
   roomier at 1232):

       cross-lane neighbours   57.7px   (need 50.9)   +13%
       same-lane, two apart    63.9px   (need 50.9)   +26%

   The two lanes are 47px apart at that width, so the band still reads as one
   outer arc with the marks braided along it rather than as two rings.

   ── 3. GROUP LABELS ARE RADIAL, NOT TANGENTIAL ───────────────────────────
   The brief allows tangential labels "ONLY if still readable". They are not.
   The two closest group centres are 13.77° apart; at the label ring that is
   about 95px of arc, and the longest label ("Containers & orchestration") is
   ~220px. It would need 33° to itself. So each pill is rotated to its own
   radius and hung INWARD from a fixed outer anchor at 392 units, which is
   where its own children's links start — the label caps its branch, the way
   a dendrogram labels an internal node. Left-half labels are rotated a
   further 180° so the text stays upright, which flips their alignment from
   right-of-anchor to left-of-anchor. That is the standard d3 radial-tree
   treatment and it is the only orientation in which 20 labels of wildly
   different lengths do not fight.

   ── 4. WHY THE SERVICE NAME PILLS ARE SUPPRESSED ─────────────────────────
   ServiceNode paints its label beneath the tile. On this variant the disc is
   full, and the label is a ~190px box that does not rotate with the wheel:

     · at rest, all six shown — Web and Staff Augmentation are 56° apart at
       the service ring, i.e. 103px, and their two labels want 142px. They
       overlap.
     · only the selected one shown — for a service in the top half the label
       hangs toward the centre. Web's label reaches within 40px of the origin
       and the Core's radius is 58px. It crosses the hub.
     · moving the service ring out to clear both needs R ≥ 150px, which
       leaves the group labels 30px of radial band instead of 220px.

   So the tile carries the icon and the hue, the name is in the legend below
   the disc (icon-keyed, because Web and Staff Augmentation share the `brand`
   hue and colour alone cannot tell them apart), and the live caption names
   whatever is selected. The button's accessible name is untouched — it is
   still `sr-only` inside ServiceNode, so the tablist reads correctly.
   ========================================================================== */

/* ── THE ANGULAR BUDGET ─────────────────────────────────────────────────── */
const GROUP_GUTTER = 3.0; // extra degrees at a group boundary
const SERVICE_GUTTER = 8.5; // extra degrees at a service boundary

/* ── THE RADII, in stage units (STAGE = 1000) ────────────────────────────
   Solved against the 976px stage, which is the narrowest the diagram is ever
   drawn at (`lg` = 1024px viewport, minus EcosystemSection's 48px of gutter).
   Everything fixed-pixel — the 116px Core, the 56px tiles, the 36px plates,
   the ~220px pill — keeps its size while the unit-to-pixel factor shrinks, so
   the narrow stage is the only one worth checking.

     px at 976    what it is                              clearance
     ──────────   ─────────────────────────────────────   ─────────
        58.0      Core radius (fixed 116px)
        77.7      service tile inner edge                  19.7px
       140.9      service tile outer edge (×1.13 active)
       155.6      longest group pill's inner end           14.7px
       382.6      group node / pill outer anchor
       400.0      inner-lane plate's nearest corner        17.4px
       425.5      inner lane
       472.4      outer lane
       497.8      outer plate's far corner        9.8px past the stage box,
                  which is fine: the stage does not clip and the section has
                  24px of padding outside it. */
const R_SERVICE = 112;
const R_GROUP = 392;
const LANES = [436, 484] as const;
const R_WEDGE = 496; // the tinted proportional sector, out to the stage edge
const R_RINGS = [
  [R_SERVICE, 0.7],
  [R_GROUP, 0.5],
  [(LANES[0] + LANES[1]) / 2, 0.32], // threads BETWEEN the two lanes
] as const;

type Mark = { tech: Tech; angle: number; radius: number };
type Group = { label: string; angle: number; marks: Mark[] };
type Service = {
  cap: Capability;
  angle: number;
  wedge: [number, number];
  width: number;
  groups: Group[];
  marks: number;
};

/* Walk the whole tree once, in reading order, laying one mark per angular
   step. Deterministic and module-scope, so the server and the client compute
   the identical numbers and there is nothing to hydrate. */
function buildLayout(): Service[] {
  const totalMarks = CAPABILITIES.reduce(
    (n, c) => n + c.stack.reduce((m, g) => m + g.items.length, 0),
    0,
  );
  const totalGroups = CAPABILITIES.reduce((n, c) => n + c.stack.length, 0);
  const step =
    (360 -
      (totalGroups - CAPABILITIES.length) * GROUP_GUTTER -
      CAPABILITIES.length * SERVICE_GUTTER) /
    totalMarks;

  let a = 0;
  /* Lane alternation is GLOBAL, not per group: it has to hold across a group
     boundary too, and restarting it per group would put two same-lane marks
     side by side at exactly the boundaries where the eye is looking for the
     grouping. */
  let k = 0;

  const services = CAPABILITIES.map<Service>((cap) => {
    const s0 = a;
    const groups = cap.stack.map<Group>((g, gi) => {
      const g0 = a;
      const marks = g.items.map<Mark>((tech) => {
        const m = { tech, angle: a, radius: LANES[k % 2] };
        k += 1;
        a += step;
        return m;
      });
      a -= step; // the last mark of a group does not need a trailing step
      const g1 = a;
      if (gi < cap.stack.length - 1) a += step + GROUP_GUTTER;
      return { label: g.group, angle: (g0 + g1) / 2, marks };
    });
    const s1 = a;
    a += step + SERVICE_GUTTER;
    return {
      cap,
      angle: (s0 + s1) / 2,
      /* The wedge runs to the middle of each service gutter, so the six
         wedges tile the full circle with no seam. */
      wedge: [s0 - (step + SERVICE_GUTTER) / 2, s1 + (step + SERVICE_GUTTER) / 2],
      width: s1 - s0 + step + SERVICE_GUTTER,
      groups,
      marks: cap.stack.reduce((m, g) => m + g.items.length, 0),
    };
  });

  /* Rotate the finished ring so the first service sits at the top, which is
     where a reader starts. Done after the walk rather than by seeding the
     start angle, because the offset depends on the walk's own result. */
  const rot = -90 - services[0].angle;
  for (const s of services) {
    s.angle += rot;
    s.wedge = [s.wedge[0] + rot, s.wedge[1] + rot];
    for (const g of s.groups) {
      g.angle += rot;
      for (const m of g.marks) m.angle += rot;
    }
  }
  return services;
}

const LAYOUT = buildLayout();

/* ── THE LINK SHAPE ───────────────────────────────────────────────────────
   Both control points sit at the PARENT's radius: the curve leaves the parent
   along its own arc and only then turns outward, arriving at the child dead
   radially. That elbow is the whole difference between a dendrogram and a
   starburst — straight chords from centre to leaf read as rays, and the
   hierarchy disappears. 0.62 rather than 0.5 on the first control point
   pushes the bend outward a little so short links do not look kinked. */
function radialLink(r0: number, a0: number, r1: number, a1: number) {
  const p0 = polarUnits(r0, a0);
  const c1 = polarUnits(r0, a0 + (a1 - a0) * 0.62);
  const c2 = polarUnits(r0, a1);
  const p1 = polarUnits(r1, a1);
  return `M${p0.x.toFixed(2)} ${p0.y.toFixed(2)}C${c1.x.toFixed(2)} ${c1.y.toFixed(
    2,
  )} ${c2.x.toFixed(2)} ${c2.y.toFixed(2)} ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
}

/* The proportional sector behind a service, as a clip-path on a plain div —
   an HTML element so it can wear HUE[hue].soft, which is a whole Tailwind
   string (rule 2). An SVG fill would have needed a colour literal. */
function wedgeClip(a0: number, a1: number) {
  const pts = ["50% 50%"];
  const steps = 20;
  for (let i = 0; i <= steps; i += 1) {
    const p = polar(R_WEDGE, a0 + ((a1 - a0) * i) / steps);
    pts.push(`${p.x.toFixed(3)}% ${p.y.toFixed(3)}%`);
  }
  return `polygon(${pts.join(",")})`;
}

/* Rotate the label to its own radius, and a further 180° on the left half so
   it stays upright. `translateX` after the rotate moves by half the label's
   OWN width along the rotated axis, which is how a pill of unknown width gets
   hung off a fixed anchor without measuring it in JS. */
function pillTransform(angle: number) {
  const flip = Math.cos((angle * Math.PI) / 180) < 0;
  return flip
    ? `translate(-50%,-50%) rotate(${(angle + 180).toFixed(3)}deg) translateX(50%)`
    : `translate(-50%,-50%) rotate(${angle.toFixed(3)}deg) translateX(-50%)`;
}

export default function EcosystemDendrogram({
  idPrefix = "dendrogram",
}: {
  idPrefix?: string;
}) {
  /* No `guardMovingLayout`: nothing on this stage moves when the selection
     changes, so a node can never slide under a stationary cursor and steal
     the hover. Only opacity and one tile fill change. */
  const eco = useEcosystem(idPrefix);
  const activeService = LAYOUT[eco.active];

  /* Dimming is the ONLY thing a selection does here, and it must not happen
     before the visitor has asked for anything — the resting picture is the
     whole tree at equal weight. */
  const dimmed = (i: number) => eco.engaged && i !== eco.active;
  const lit = (i: number) => eco.engaged && i === eco.active;

  return (
    <>
      <div
        className="eco-stage relative mx-auto hidden aspect-square w-full lg:block"
        {...eco.stageProps}
      >
        {/* ---- the proportional wedges --------------------------------
            Always drawn, at every weight, because they ARE the argument: the
            reason Backend's arc is wider than Mobile's is that Backend has
            four more technologies, and a reader should be able to see that
            without touching anything. */}
        {/* THE WEDGE IS THE HIT TARGET, not just the service tile.

            Hovering only worked from the small tile at the centre of a wedge,
            so the group labels and the marks - the parts a reader is actually
            looking at - did nothing. The wedge already exists and already
            describes exactly the region that belongs to one service, so it
            becomes the hover target for it: anywhere inside Backend's arc
            opens Backend.

            It reuses `nodeProps(i).onMouseEnter`, so it inherits the pinning
            rule and the moving-layout guard rather than growing a second,
            slightly-different selection path. The wedges stay `aria-hidden`
            and are drawn first, so they sit under every node: the buttons
            remain the only thing in the accessibility tree and the only
            thing a keyboard reaches. */}
        <div className="absolute inset-0" aria-hidden="true">
          {LAYOUT.map((s, i) => (
            <div
              key={s.cap.k}
              onMouseEnter={eco.nodeProps(i).onMouseEnter}
              className={`absolute inset-0 cursor-pointer ${HUE[s.cap.hue].soft}`}
              style={{
                clipPath: wedgeClip(s.wedge[0], s.wedge[1]),
                opacity: !eco.engaged ? 0.5 : lit(i) ? 1 : 0.16,
                transition: "opacity .35s ease-out",
              }}
            />
          ))}
        </div>

        {/* ---- rings and every edge in the tree -------------------------
            One SVG, under the HTML nodes. No ids, no <defs>, no gradients:
            this component renders twice per page (desktop stage + the list's
            own markup) and a duplicated id resolves to whichever came first.

            [data-reveal] is deliberately NOT on this SVG. The stage is
            `hidden lg:block`, so below the breakpoint the element has no box
            and an IntersectionObserver never fires for it — it would sit
            undrawn forever. The observed ancestor is EcosystemSection's
            wrapper, and `[data-reveal].is-in .eco-line` reaches these paths
            from there to release the dash. */}
        <svg
          viewBox={`0 0 ${STAGE} ${STAGE}`}
          className="pointer-events-none absolute inset-0 size-full"
          aria-hidden="true"
          fill="none"
        >
          {R_RINGS.map(([r, o]) => (
            <circle
              key={r}
              cx={STAGE / 2}
              cy={STAGE / 2}
              r={r}
              className="stroke-border"
              strokeWidth={1}
              opacity={o}
            />
          ))}

          {LAYOUT.map((s, i) => {
            const sp = polarUnits(R_SERVICE, s.angle);
            return (
              /* One <g> per service so the whole branch dims as a unit. The
                 opacity lives on the group and the dash on the paths, which
                 keeps my transition off the `transition` property .eco-line
                 owns — set both on one element and the inline one wins and
                 the draw-on never happens. */
              <g
                key={s.cap.k}
                data-travel={eco.engaged && lit(i) ? "true" : undefined}
                style={{
                  opacity: !eco.engaged ? 0.42 : lit(i) ? 0.85 : 0.12,
                  transition: "opacity .35s ease-out",
                }}
              >
                {/* core → service. Starts at the origin and is covered by the
                    Core's own disc, which is opaque and sits at z-2. */}
                <line
                  x1={STAGE / 2}
                  y1={STAGE / 2}
                  x2={sp.x}
                  y2={sp.y}
                  pathLength={1}
                  className="eco-line stroke-accent"
                  strokeWidth={1.6}
                  style={{ "--d": `${80 + i * 50}ms` } as React.CSSProperties}
                />
                {s.groups.map((g, gi) => (
                  <g key={g.label}>
                    <path
                      d={radialLink(R_SERVICE, s.angle, R_GROUP, g.angle)}
                      pathLength={1}
                      className="eco-line stroke-accent"
                      strokeWidth={1.4}
                      style={
                        {
                          "--d": `${380 + i * 50 + gi * 35}ms`,
                        } as React.CSSProperties
                      }
                    />
                    {g.marks.map((m, ti) => (
                      <path
                        key={m.tech.name}
                        d={radialLink(R_GROUP, g.angle, m.radius, m.angle)}
                        pathLength={1}
                        className="eco-line stroke-accent"
                        strokeWidth={1.1}
                        style={
                          {
                            "--d": `${620 + i * 50 + gi * 35 + ti * 14}ms`,
                          } as React.CSSProperties
                        }
                      />
                    ))}
                  </g>
                ))}

                {/* THE DOTS, on the open wedge only. A second pass over the
                    same geometry so each one paints above every edge: core to
                    service, service to group, group to each mark - the whole
                    chain out to the last child. */}
                {/* The spoke flows always; the wedge only when it opens. */}
                <DotEdge x1={STAGE / 2} y1={STAGE / 2} x2={sp.x} y2={sp.y} />
                {eco.engaged &&
                  lit(i) &&
                  s.groups.map((g) => (
                    <g key={`dot-${g.label}`}>
                      <DotEdge
                        d={radialLink(R_SERVICE, s.angle, R_GROUP, g.angle)}
                      />
                      {g.marks.map((m) => (
                        <DotEdge
                          key={`dot-${m.tech.name}`}
                          d={radialLink(R_GROUP, g.angle, m.radius, m.angle)}
                        />
                      ))}
                    </g>
                  ))}
              </g>
            );
          })}
        </svg>

        <Core />

        {/* ---- level 1 --------------------------------------------------
            `absolute inset-0`, not `contents`: a role on a display:contents
            element is a known a11y-tree hazard (see EcosystemBranch's note).

            `[&_span.top-full]:hidden` suppresses ServiceNode's label pill —
            see §4 of the header comment for the three measurements that
            forced it. The pill is decorative (`pointer-events-none`, and the
            button's real accessible name is the `sr-only` span beside it), so
            nothing is lost to assistive tech. */}
        <div
          role="tablist"
          aria-label="Interloid services"
          aria-orientation="horizontal"
          className="pointer-events-none absolute inset-0 [&>*]:pointer-events-auto [&_span.top-full]:hidden"
        >
          {LAYOUT.map((s, i) => {
            const p = polar(R_SERVICE, s.angle);
            return (
              <ServiceNode
                key={s.cap.k}
                capability={s.cap}
                index={i}
                active={i === eco.active}
                closed={dimmed(i)}
                nodeProps={eco.nodeProps(i)}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              />
            );
          })}
        </div>

        {/* ---- levels 2 and 3 -------------------------------------------
            All six subtrees are always mounted AND always open. Nothing is
            conditionally rendered — Reveal.tsx observes [data-reveal] once on
            mount, and anything created later by a state change would never be
            observed. `data-open="true"` is a static attribute so the marks are
            visible with JavaScript off too; the only thing state touches is an
            inline opacity, which the .eco-grow transition and its `--d` carry
            as a ripple outward from the service. */}
        {LAYOUT.map((s, i) => (
          <div
            key={s.cap.k}
            {...eco.panelProps(i)}
            data-open="true"
            className="eco-branch contents"
          >
            {s.groups.map((g, gi) => (
              <div key={g.label} className="contents">
                <GroupPill
                  label={g.label}
                  hue={s.cap.hue}
                  delay={gi * 40}
                  dim={eco.engaged && !lit(i)}
                  style={{
                    left: `${polar(R_GROUP, g.angle).x}%`,
                    top: `${polar(R_GROUP, g.angle).y}%`,
                    transform: pillTransform(g.angle),
                    /* dim by COLOUR, not opacity - see GroupPill. A
                       translucent label lets the links behind it show
                       through, which is the struck-out look reported. */
                    opacity: undefined,
                  }}
                />
                {g.marks.map((m, ti) => {
                  const p = polar(m.radius, m.angle);
                  return (
                    <TechNode
                      key={`${g.label}-${m.tech.name}`}
                      tech={m.tech}
                      delay={gi * 40 + ti * 16}
                      style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        /* dim by COLOUR, not opacity - see GroupPill. A
                       translucent label lets the links behind it show
                       through, which is the struck-out look reported. */
                    opacity: undefined,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ---- the key -----------------------------------------------------
          Six icon-keyed chips, in the disc's own clockwise order, carrying
          the name the tile cannot. Hue is not enough on its own: Web
          Development and Staff Augmentation are both `brand`. `aria-hidden`
          because the tablist above already announces all six names and a
          screen reader does not need them twice. */}
      <div className="mt-6 hidden lg:block">
        <ul
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2"
          aria-hidden="true"
        >
          {LAYOUT.map((s, i) => (
            <li
              key={s.cap.k}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition-opacity duration-300 ${
                i === eco.active
                  ? "border-accent/40 bg-card"
                  : "border-border bg-background"
              }`}
              style={{ opacity: dimmed(i) ? 0.45 : 1 }}
            >
              <span
                className={`grid size-6 shrink-0 place-items-center rounded-lg ${
                  HUE[s.cap.hue].soft
                } ${HUE[s.cap.hue].text}`}
              >
                <Icon name={s.cap.icon} className="size-3.5" />
              </span>
              <span className="text-[12px] font-semibold text-muted-strong">
                {s.cap.name}
              </span>
              <span className="text-[11px] font-bold tabular-nums text-muted-foreground">
                {s.marks}
              </span>
            </li>
          ))}
        </ul>

        {/* The arc arithmetic, said out loud. It is the reason the wedges are
            different sizes, and a reader who notices the asymmetry deserves
            the explanation rather than having to infer it. */}
        <p className="mt-4 text-center text-[13px] leading-[1.6] text-muted-foreground">
          <span className="font-semibold text-foreground">
            {activeService.cap.name}
          </span>{" "}
          — {activeService.groups.length} groups, {activeService.marks}{" "}
          technologies, {activeService.width.toFixed(0)}° of the circle. Every
          technology owns the same 4.3° of arc, so a wedge is exactly as wide
          as the stack behind it.
        </p>

        {/* The tabpanel swap is silent to a screen reader — the panels are a
            positioned diagram, and nothing announces which one is current.
            One polite status line names it and its size; the contents are
            reachable in the list below. */}
        <p role="status" aria-live="polite" className="sr-only">
          {activeService.cap.name}: {activeService.groups.length} groups,{" "}
          {activeService.marks} technologies.
        </p>
      </div>

      <EcosystemList capabilities={CAPABILITIES} idPrefix={idPrefix} />
    </>
  );
}
