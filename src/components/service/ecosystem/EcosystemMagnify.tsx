"use client";

import type { Capability, Tech } from "@/content/service";
import { CAPABILITIES } from "@/content/service";
import { HUE } from "@/content/site";
import {
  Backdrop,
  Core,
  EcosystemList,
  GroupPill,
  Links,
  ServiceNode,
  TechNode,
  connectorPoints,
} from "./parts";
import {
  SERVICE_ANGLES,
  SERVICE_RADII,
  polar,
  polarUnits,
  type Point,
} from "./geometry";
import { useEcosystem } from "./useEcosystem";

/* ==========================================================================
   VARIANT E — MAGNIFY
   ==========================================================================
   The user's sentence: "when i hover a web the web is convert it larger
   circle then the interloid and connect the 3 level".

   So the selected service does not merely light up — it INFLATES. A 240px
   disc grows out of its 56px tile, which is 2.07x the Interloid core and the
   biggest object on the stage by a wide margin; the core shrinks to 72% and
   dims; the other five services drop to 60% and 45% opacity and become small
   marks on the ring they were already on. The service's two lower levels then
   grow outward from the disc's rim, each joined to its parent by a drawn
   edge, so the whole thing reads as the map zooming its attention onto one
   service rather than as a panel opening.

   ── WHY IT GROWS IN PLACE AND DOES NOT TRAVEL TO THE CENTRE ───────────────
   The brief offered "move it to the centre and push the core aside". I
   measured that option and rejected it, for the rule useEcosystem's banner
   sets out: a node must never move out from under the cursor that opened it.

   At rest a service tile sits 167px (even indices) or 226px (odd) from the
   stage centre, so a cursor anywhere on the tile is 139–254px out. For the
   opened body to still be under that cursor after the move, it has to cover
   that range. A disc at the stage centre would need a radius of 254px — 508px
   across on a 940px stage — which leaves no room at all for levels 2 and 3.
   The disc therefore stays on the service's own angle at OPEN_RADIUS = 194
   units (182px):

     worst-case cursor offset  |254 − 182| = 72px radially, 28px laterally
     → 77.4px from the disc centre, inside a 120px radius by 42px.

   Every cursor that can open a service is inside the disc that results, on
   all six. The node moves at most 44px, and it moves TOWARD the cursor's side
   of the growing disc, never out from under it. That is also why this variant
   does NOT pass `guardMovingLayout`: only the selected node ever moves, the
   other five are pinned to the radii they were resting on, so no node can
   slide under a stationary cursor and steal the selection.

   Disorientation — the brief's worry about growing at your own angle — is
   answered by growing ABOUT THE NODE'S OWN CENTRE. The thing you are looking
   at stays exactly where you are looking; it gets bigger around that point.
   A disc that flies to the centre is the disorienting version.

   ── WHY THE STAGE IS 940px AND NOT BLOOM'S 860 ───────────────────────────
   The radial budget is unforgiving and every number below was fixed by it.
   Working outward along the open service's own axis on a 940px square (the
   stage is always EXACTLY 940: the section's column is `max-w-7xl px-6`, so
   even at the lg breakpoint it is 1024 − 48 = 976px wide, and 940 < 976 at
   every width the diagram is shown at):

     core, shrunk to 0.72         41.8px radius
     ── 20px clearance
     the disc            182px ± 120px      →  62 … 302px
     ── 30px clearance
     group pills          345 / 371px       →  332 … 384px   (26px tall)
     ── 33px clearance
     technology marks     435px             →  417 … 453px   (36px plates)
     ── 17px to the stage edge at 470px

   At 860px that chain is 24px over budget and either the disc has to drop
   under 200px — below the size the brief asks for — or the marks fall off the
   stage. 940px is the smallest square the picture fits in, and it is still
   inside the column at every viewport ≥ 1024.

   ── THE ANGULAR BUDGET IS PER SERVICE, NOT A FIXED SECTOR ────────────────
   geometry.ts's SECTOR/techAngles give every group an equal slice of a fixed
   150°, with the items filling 84% of it. That leaves an inter-group gutter
   of 0.16 × slice, which for a four-group service is 6° — 41px of arc at
   Bloom's radius. Two 36px plates 41px apart do not overlap on the centre
   line but their BOUNDING BOXES do as soon as the chord runs diagonally, and
   whether it does is pure luck of the service's angle. I would rather not
   ship a clearance that depends on which way a branch happens to point.

   So this variant sizes the sector to the content instead: a fixed 9° between
   marks inside a group and a fixed 13° between groups. At 435px those are
   68px and 96px of arc — both comfortably over the 51px two 36px plates need
   in the worst (diagonal) case. The spans that fall out are

     Web 98°   Mobile 71°   Backend 111°   Cloud 102°   AI 102°   Team 76°

   all inside the 150° a dimmed neighbour frees up, and a small service now
   opens a small branch instead of stretching three groups across a sector
   built for four. Each pill sits at the mean angle of the marks it labels,
   which is geometry.ts's own hard-won rule and the only arrangement a reader
   can interpret.
   ========================================================================== */

/* The stage is always exactly this wide at lg and above — see the note above.
   Every fixed-pixel element on the stage (the 116px core, the 56px tiles, the
   36px plates, the disc) is only safe against the percentage-positioned
   geometry at the SMALLEST stage it is ever drawn at, which is why pinning
   the width matters more than making it fluid. */
const STAGE_PX = 940;
const PX = 1000 / STAGE_PX; // px → stage units

/** The magnified disc. 240px across: 2.07× the 116px core at rest, 2.87×
    the core once the core has shrunk. The top of the brief's 200–240 range,
    because the widest service name ("Cloud Infrastructure & DevOps", ~196px
    of label pill sitting 49px below the tile centre) only clears the rim of
    a disc this size — at 224px it crosses it. */
const LENS_PX = 240;
const LENS_R_U = (LENS_PX / 2) * PX; // 127.7 stage units

/** Where the opened service sits. Chosen so the cursor that opened it is
    always inside the disc (the calculation is in the header) and so the core
    still clears the disc's inner edge by 20px. */
const OPEN_RADIUS = 194; // units = 182px

/** The five closed services keep the radius they were resting on and shrink
    in place. Bloom pulls its closed services IN, to 0.62 — that is exactly
    wrong here: a ray 60° off the open service passes 158px from the disc
    centre at its closest, so a neighbour pulled inward moves TOWARD the disc,
    not away from it. Measured at Bloom's 0.62 the nearest neighbour's box was
    3px inside the disc. Leaving them where they are gives 31–63px. */
const CLOSED_SCALE = 0.6;

/** The core steps back. Not sideways — the Backdrop's six connectors all
    radiate from the stage centre, so a core that translates leaves them
    starting in empty space. It shrinks and dims instead, which is what
    "no longer the subject" has to mean for a fixed element at the origin. */
const CORE_SCALE = 0.72;

/** Level 2 alternates, for the reason geometry.ts alternates its own: the
    longest pill is ~196px wide and adjacent pills can be 26° apart, which is
    177px of centre-to-centre at one radius. The 26px radial stagger is what
    turns that into a clean read. */
/* Pulled in from [367, 395]. A pill is ~140px wide and its own first mark
   sits almost radially outward of it, so the two boxes are near-concentric
   and a 68-unit gap was not enough - measured, "Node.js ecosystem" over
   "NestJS" and "Ruby ecosystem" over "Ruby". 100 units of gap at the outer
   lane clears the widest pill. */
const PILL_RADII = [335, 363] as const; // units = 315 / 341px
/** Level 3. 435px + an 18px plate = 453px, 17px inside the 470px stage. */
const MARK_RADIUS = 463; // units = 435px

const MARK_PITCH = 9; // degrees between marks inside one group
const GROUP_GUTTER = 13; // degrees between one group's last mark and the next's first

/** 400–600ms, per the brief. 520ms with a heavy ease-out: the disc travels no
    distance, it only scales, and a scale that big reads as sluggish under
    600ms and as a pop under 400. */
const EASE = "cubic-bezier(.16,1,.3,1)";
const MOVE = `.52s ${EASE}`;

type BranchLayout = {
  label: string;
  centre: number;
  radius: number;
  items: { tech: Tech; angle: number }[];
}[];

/** Lay a service's stack out as angles relative to its own axis. Fixed pitch
    inside a group, fixed gutter between groups, the whole thing centred on
    the service — so the branch is as wide as its content needs and no wider. */
function layoutBranch(cap: Capability): BranchLayout {
  const span =
    cap.stack.reduce((s, g) => s + (g.items.length - 1) * MARK_PITCH, 0) +
    (cap.stack.length - 1) * GROUP_GUTTER;
  let cursor = -span / 2;
  return cap.stack.map((g, gi) => {
    const width = (g.items.length - 1) * MARK_PITCH;
    const start = cursor;
    cursor += width + GROUP_GUTTER;
    return {
      label: g.group,
      centre: start + width / 2,
      radius: PILL_RADII[gi % 2],
      items: g.items.map((t, ti) => ({ tech: t, angle: start + ti * MARK_PITCH })),
    };
  });
}

/** An edge between two points, in stage units, trimmed at both ends so it
    starts on the disc's rim / a pill's edge rather than at its centre. Doing
    it as a vector rather than radially matters: the pills are placed by angle
    from the STAGE centre but the edges leave the DISC's centre, and those two
    directions differ by up to 40° at the edges of a branch. */
function edge(from: Point, to: Point, padFrom: number, padTo: number) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return {
    x1: from.x + ux * padFrom,
    y1: from.y + uy * padFrom,
    x2: to.x - ux * padTo,
    y2: to.y - uy * padTo,
  };
}

export default function EcosystemMagnify({
  idPrefix = "magnify",
}: {
  idPrefix?: string;
}) {
  /* No `guardMovingLayout`. Only the selected node moves, and it moves along
     its own radius toward a disc that already covers the cursor — nothing can
     slide under a stationary pointer and steal the selection. Passing the
     guard would cost the 640ms pointer-events lockout on the other five for
     no benefit. */
  /* `true`: this variant MOVES its service nodes when a branch opens, so a
     node can slide under a resting pointer and fire a mouseenter that steals
     the selection - including one the keyboard just made. Measured: arrowing
     off a node reverted the selection whenever the mouse was left inside the
     stage. The guard ignores a hover that arrived with no pointer movement.
     See the hook banner. */
  const eco = useEcosystem(idPrefix, true);
  const activeCap = CAPABILITIES[eco.active];
  const activeTechCount = activeCap.stack.reduce((n, g) => n + g.items.length, 0);

  /* The Backdrop's connector for the OPEN service has to stop at the disc's
     rim, not run under it. connectorPoints multiplies by 0.78, so the radius
     handed to it is back-solved from where the line should end. */
  const points = connectorPoints(
    CAPABILITIES.map((_, i) =>
      eco.engaged && i === eco.active
        ? (OPEN_RADIUS - LENS_R_U) / 0.78
        : SERVICE_RADII[i],
    ),
    SERVICE_ANGLES,
  );

  return (
    <>
      <div
        /* 940px — the smallest square the disc + three levels fit in, and
           still inside the section's column at every width ≥ lg. The stage is
           `hidden lg:block`, never a [data-reveal] node: below lg the whole
           diagram is replaced by EcosystemList. */
        className="eco-stage relative mx-auto hidden aspect-square w-full max-w-[940px] lg:block"
        {...eco.stageProps}
      >
        <Backdrop
          nodes={points}
          activeIndex={eco.active}
          engaged={eco.engaged}
        />

        {/* ---- the core, demoted ---------------------------------------
            Wrapped rather than restyled: Core is shared and frozen, and it
            positions itself at the centre of its containing block, so a
            full-bleed wrapper scaled about its own centre shrinks the core in
            place without touching it. pointer-events-none or this wrapper
            would swallow every hover on the stage. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{
            transform: `scale(${eco.engaged ? CORE_SCALE : 1})`,
            opacity: eco.engaged ? 0.85 : 1,
            transition: `transform ${MOVE}, opacity .38s ease-out`,
          }}
        >
          <Core />
        </div>

        {/* ---- the magnified disc --------------------------------------
            One per service, always in the DOM, scaled to 56/240 = 0.233 when
            closed — i.e. it rests at exactly the size of the tile it grows
            out of, so opening a service reads as that tile inflating rather
            than as a new object fading in. Never conditionally rendered: this
            is not a [data-reveal] node, but the same rule keeps the six discs
            symmetric and lets the closed ones transition instead of pop. */}
        {CAPABILITIES.map((c, i) => {
          const open = eco.engaged && i === eco.active;
          const p = polar(OPEN_RADIUS, SERVICE_ANGLES[i]);
          const h = HUE[c.hue];
          const count = c.stack.reduce((n, g) => n + g.items.length, 0);
          return (
            <span
              key={c.k}
              aria-hidden="true"
              className={`pointer-events-none absolute z-[1] rounded-full border border-hairline shadow-lg ring-1 ${h.soft} ${h.ring}`}
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: LENS_PX,
                height: LENS_PX,
                transform: `translate(-50%,-50%) scale(${open ? 1 : 56 / LENS_PX})`,
                opacity: open ? 1 : 0,
                transition: `transform ${MOVE}, opacity .38s ease-out`,
              }}
            >
              {/* An inner rim at 0.78 of the radius: it is what makes the
                  disc read as a lens with a focus rather than as a blob, and
                  it gives the eye a second edge to judge the size against. */}
              <span className="absolute inset-[26px] rounded-full border border-hairline" />
              {/* The stack summary, low in the disc under the service's own
                  label pill. Decorative — the same sentence is in the live
                  region below, where a screen reader will actually hear it. */}
              <span className="absolute bottom-[22px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-muted-foreground">
                {c.stack.length} groups · {count} technologies
              </span>
            </span>
          );
        })}

        {/* ---- level 1 -------------------------------------------------
            `absolute inset-0`, NOT `contents` — a role on a display:contents
            element is a known a11y-tree hazard; see EcosystemBranch's note. */}
        <div
          role="tablist"
          aria-label="Interloid services"
          aria-orientation="horizontal"
          className="pointer-events-none absolute inset-0 [&>*]:pointer-events-auto"
        >
          {CAPABILITIES.map((c, i) => {
            const isActive = i === eco.active;
            /* Closed services do not move at all — see CLOSED_SCALE. Only the
               opened one travels, and only as far as OPEN_RADIUS. */
            const r =
              eco.engaged && isActive ? OPEN_RADIUS : SERVICE_RADII[i];
            const p = polar(r, SERVICE_ANGLES[i]);
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
                  /* THE INLINE TRANSFORM IS ONLY SET ONCE ENGAGED, AND THAT
                     IS DELIBERATE. At rest .eco-node runs the ambient cycle
                     keyframe, and CSS animations outrank inline styles in the
                     cascade — so an inline transform here would be silently
                     ignored until the cycle stopped, and the node would jump
                     the moment it did. Setting `animation: none` alongside it
                     hands control over explicitly, which also freezes the map
                     while a branch is open: with a branch open the ambient
                     1.13 pulse is both noise and a real clearance risk.
                     It also overrides .eco-node[data-active]'s own scale(1.13)
                     — the active tile stays at 1.0 because its label pill sits
                     49px below its centre and the widest name would cross the
                     disc's rim if the pair were scaled up. The disc is the
                     magnification; the tile is its subject. */
                  ...(eco.engaged
                    ? {
                        animation: "none",
                        transform: `translate(-50%,-50%) scale(${
                          isActive ? 1 : CLOSED_SCALE
                        })`,
                      }
                    : null),
                  transition: `left ${MOVE}, top ${MOVE}, transform ${MOVE}, opacity .3s`,
                }}
              />
            );
          })}
        </div>

        {/* ---- levels 2 and 3 ------------------------------------------
            All six subtrees stay mounted and only the open one is revealed.
            Reveal.tsx observes [data-reveal] once on mount, so a subtree
            created later by a state change would never be observed — the rule
            Roles.tsx's filter follows for the same reason. */}
        {CAPABILITIES.map((c, i) => {
          const open = eco.engaged && i === eco.active;
          const axis = SERVICE_ANGLES[i];
          const groups = layoutBranch(c);
          const discCentre = polarUnits(OPEN_RADIUS, axis);

          /* The edges, in stage units, under the nodes. Every level is joined
             to its parent: disc → pill, pill → each of its marks. Without
             them the marks are merely near their group rather than part of
             it, which is the failure parts.tsx's Links banner describes. */
          const edges = groups.flatMap((g, gi) => {
            const pill = polarUnits(g.radius, axis + g.centre);
            return [
              { ...edge(discCentre, pill, LENS_R_U + 4, 17), d: open ? 40 + gi * 55 : 0 },
              ...g.items.map((it, ti) => ({
                ...edge(pill, polarUnits(MARK_RADIUS, axis + it.angle), 17, 22),
                d: open ? 130 + gi * 55 + ti * 28 : 0,
              })),
            ];
          });

          return (
            <div
              key={c.k}
              {...eco.panelProps(i)}
              data-open={open ? "true" : "false"}
              className="eco-branch contents"
            >
              <Links edges={edges} open={open} />
              {groups.map((g, gi) => {
                const gp = polar(g.radius, axis + g.centre);
                return (
                  <div key={g.label} className="contents">
                    <GroupPill
                      label={g.label}
                      hue={c.hue}
                      delay={open ? 60 + gi * 55 : 0}
                      style={{ left: `${gp.x}%`, top: `${gp.y}%` }}
                    />
                    {g.items.map((it, ti) => {
                      const tp = polar(MARK_RADIUS, axis + it.angle);
                      return (
                        <TechNode
                          key={`${g.label}-${it.tech.name}`}
                          tech={it.tech}
                          delay={open ? 150 + gi * 55 + ti * 28 : 0}
                          style={{ left: `${tp.x}%`, top: `${tp.y}%` }}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* THE PANEL SWAP IS SILENT TO A SCREEN READER without this: the
          tabpanel's contents change but nothing announces it, so a keyboard
          user arrowing round the wheel hears only the tab names. It lives
          OUTSIDE the stage on purpose — the stage is display:none below lg,
          and a live region inside it would not exist at those widths. */}
      <p role="status" aria-live="polite" className="sr-only">
        {eco.engaged
          ? `${activeCap.name}: ${activeCap.stack.length} groups, ${activeTechCount} technologies.`
          : ""}
      </p>

      <EcosystemList capabilities={CAPABILITIES} idPrefix={idPrefix} />
    </>
  );
}
