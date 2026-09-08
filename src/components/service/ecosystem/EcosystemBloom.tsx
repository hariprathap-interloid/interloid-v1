"use client";

import { CAPABILITIES } from "@/content/service";
import {
  Backdrop,
  Core,
  EcosystemList,
  GroupPill,
  ServiceNode,
  TechNode,
  connectorPoints,
} from "./parts";
import {
  CLOSED_SERVICE_FACTOR,
  LEVEL_3_RADIUS,
  OPEN_SERVICE_RADIUS,
  SERVICE_ANGLES,
  SERVICE_RADII,
  groupAngles,
  groupRadius,
  polar,
  techAngles,
} from "./geometry";
import { useEcosystem } from "./useEcosystem";

/* ==========================================================================
   VARIANT A — RADIAL BLOOM
   ==========================================================================
   The one closest to the reference image. The six services stay on their
   ring at all times; when one is selected the other five recede — dimmed,
   shrunk and pulled toward the core — and the selected service's subtree
   BLOOMS OUTWARD inside its own angular sector: group pills on a second
   radius, technology marks on a third.

   ── THE ANGULAR BUDGET IS THE WHOLE PROBLEM ──────────────────────────────
   Six services means 60° each, and 60° is nowhere near enough for four
   groups and twelve marks. The move that makes it work: because the
   neighbours are dimmed and pulled in, the open branch BORROWS their angle
   and gets 116° (geometry.ts SECTOR). At LEVEL_3_RADIUS that is a 765px arc
   for at most twelve 32px plates — about 63px each, so they clear by ~31px.

   Cost, stated honestly: the branch overlaps where the neighbours WERE. That
   is why they are pulled to 0.72 of their radius rather than merely faded —
   at full radius the open branch's outermost marks would sit on top of them.

   ── WHY THE SERVICES DO NOT MOVE ─────────────────────────────────────────
   The selected service stays exactly where it is. An earlier pass slid it
   inward to make room and it was disorienting: the thing under the cursor
   moved away from the cursor. The room comes from the neighbours instead.
   ========================================================================== */
export default function EcosystemBloom({
  idPrefix = "bloom",
}: {
  idPrefix?: string;
}) {
  const eco = useEcosystem(idPrefix);
  const points = connectorPoints(SERVICE_RADII, SERVICE_ANGLES);

  return (
    <>
      <div
        className="eco-stage relative mx-auto hidden aspect-square w-full max-w-[860px] lg:block"
        {...eco.stageProps}
      >
        <Backdrop
          nodes={points}
          activeIndex={eco.active}
          engaged={eco.engaged}
        />
        <Core />

        {/* ---- level 1 ------------------------------------------------- */}
        {/* `absolute inset-0`, NOT `contents` - see EcosystemBranch's note. */}
        <div
          role="tablist"
          aria-label="Interloid services"
          aria-orientation="horizontal"
          className="pointer-events-none absolute inset-0 [&>*]:pointer-events-auto"
        >
          {CAPABILITIES.map((c, i) => {
            const isActive = i === eco.active;
            /* At rest every service sits on its own alternating radius - the
               reference picture. Once a branch opens, the open service moves
               to a single shared radius, so the branch always starts the same
               distance from the core, and the other five retreat to make room
               for it. The transition on left/top is what makes that read as
               the map re-balancing rather than as nodes teleporting. */
            const r = !eco.engaged
              ? SERVICE_RADII[i]
              : isActive
                ? OPEN_SERVICE_RADIUS
                : SERVICE_RADII[i] * CLOSED_SERVICE_FACTOR;
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
                  transition:
                    "left .45s cubic-bezier(.16,1,.3,1), top .45s cubic-bezier(.16,1,.3,1), opacity .3s",
                }}
              />
            );
          })}
        </div>

        {/* ---- levels 2 and 3 ------------------------------------------
            Every subtree is always in the DOM and only the open one is
            revealed. Reveal.tsx observes once on mount, so a subtree created
            later by a state change would never be observed — the rule that
            Roles.tsx's filter follows for the same reason. */}
        {CAPABILITIES.map((c, i) => {
          const open = eco.engaged && i === eco.active;
          const angle = SERVICE_ANGLES[i];
          const gAngles = groupAngles(angle, c.stack.length);
          return (
            <div
              key={c.k}
              {...eco.panelProps(i)}
              data-open={open ? "true" : "false"}
              className="eco-branch contents"
            >
              {c.stack.map((g, gi) => {
                const gp = polar(groupRadius(gi), gAngles[gi]);
                const tAngles = techAngles(angle, gi, c.stack.length, g.items.length);
                return (
                  <div key={g.group} className="contents">
                    <GroupPill
                      label={g.group}
                      hue={c.hue}
                      delay={open ? 60 + gi * 55 : 0}
                      style={{ left: `${gp.x}%`, top: `${gp.y}%` }}
                    />
                    {g.items.map((t, ti) => {
                      const tp = polar(LEVEL_3_RADIUS, tAngles[ti]);
                      return (
                        <TechNode
                          key={`${g.group}-${t.name}`}
                          tech={t}
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

      <EcosystemList capabilities={CAPABILITIES} idPrefix={idPrefix} />
    </>
  );
}
