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
  fan,
  groupAngles,
  groupRadius,
  polar,
  techAngles,
} from "./geometry";
import { useEcosystem } from "./useEcosystem";

/* ==========================================================================
   VARIANT C — ORBIT SHELLS
   ==========================================================================
   Three genuine concentric shells, and the wheel RE-BALANCES: the selected
   service swings to a fixed reading position and the other five compress into
   the arc opposite, freeing a wide, always-identical sector for the subtree.

   ── WHY RE-BALANCE INSTEAD OF BORROWING ANGLE (variant A) ────────────────
   In A the branch opens wherever the service happens to sit, so a branch at
   the top of the wheel and a branch at the bottom-left are different shapes
   and different reading directions. Here every branch opens into the SAME
   sector, pointing right, so the reader learns one shape and re-uses it six
   times. The wheel turning is also the clearest possible signal that a
   selection happened — nothing else on the page moves that much.

   ── THE COST ─────────────────────────────────────────────────────────────
   Motion. Every selection moves all six services, which is a lot of travel
   for a hover and can feel restless if the reader is sweeping across the
   nodes. Mitigated by a slow, heavily-eased transition and by the fact that
   the resting cycle stops the moment a pointer enters the stage — but it is
   the honest weakness of this variant and the reason it may lose to A.

   ── GEOMETRY ─────────────────────────────────────────────────────────────
   Open sector: the selected service is placed at ANCHOR (0°, pointing right)
   and its groups and marks fan symmetrically about that. The other five are
   distributed across the 210° on the far side, so they stay a legible ring
   rather than a heap.
   ========================================================================== */

const ANCHOR = 0; // the selected service always swings to due right
/* 250, not 210. The five closed services share the far arc, and at 210 two of
   them collided - measured, Web Development on Staff Augmentation. They have
   the room; they were simply not being given it. */
const AWAY_SPREAD = 250; // the arc the other five share, centred opposite

export default function EcosystemShells({
  idPrefix = "shells",
}: {
  idPrefix?: string;
}) {
  /* This variant moves every node on selection, so its hovers have to be
     screened for the ones the movement itself caused. See the hook's note. */
  const eco = useEcosystem(idPrefix, true);
  const active = CAPABILITIES[eco.active];

  /* Where every service sits given the current selection. The selected one
     goes to ANCHOR; the rest keep their cyclic order — so the wheel reads as
     having TURNED rather than reshuffled — spread across the far arc. */
  const angleFor = (i: number) => {
    /* Untouched, the wheel is the reference picture on its own angles. It
       only turns once the visitor has actually chosen something. */
    if (!eco.engaged) return SERVICE_ANGLES[i];
    if (i === eco.active) return ANCHOR;
    const n = CAPABILITIES.length;
    /* position of i in the ring, counted from the selected one */
    const offset = (i - eco.active + n) % n; // 1..n-1
    const others = fan(ANCHOR + 180, n - 1, AWAY_SPREAD);
    /* offset 1 is the neighbour clockwise from the selection; the fan runs
       the same way, so the ring's order is preserved through the turn. */
    return others[offset - 1];
  };

  const radiusFor = (i: number) => {
    if (!eco.engaged) return SERVICE_RADII[i];
    return i === eco.active
      ? OPEN_SERVICE_RADIUS
      : SERVICE_RADII[i] * CLOSED_SERVICE_FACTOR;
  };

  const points = connectorPoints(
    CAPABILITIES.map((_, i) => radiusFor(i)),
    CAPABILITIES.map((_, i) => angleFor(i)),
  );

  const groupCount = active.stack.length;
  /* The same sector maths as variant A, so the two are comparable and the
     overlap guarantees carry over. The first build used a hand-rolled 96
     degrees here and its marks collided - React.js on Next.js, Express.js on
     Ruby - because the sector was too narrow for six items in one group. */
  const gAngles = groupAngles(ANCHOR, groupCount);

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

        {/* `absolute inset-0`, NOT `contents` - see EcosystemBranch's note. */}
        <div
          role="tablist"
          aria-label="Interloid services"
          aria-orientation="horizontal"
          className="pointer-events-none absolute inset-0 [&>*]:pointer-events-auto"
        >
          {CAPABILITIES.map((c, i) => {
            const p = polar(radiusFor(i), angleFor(i));
            return (
              <ServiceNode
                key={c.k}
                capability={c}
                index={i}
                active={i === eco.active}
                closed={eco.engaged && i !== eco.active}
                nodeProps={eco.nodeProps(i)}
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  /* Slow and heavily eased: six nodes travelling at once is
                     a lot of movement, and a fast tween of it reads as a
                     glitch rather than as a mechanism turning. */
                  transition:
                    "left .62s cubic-bezier(.22,1,.28,1), top .62s cubic-bezier(.22,1,.28,1), opacity .3s",
                }}
              />
            );
          })}
        </div>

        {/* Only the selected subtree is positioned, because in this variant
            the geometry depends on the selection: an inactive branch has no
            meaningful place to be. The panels for the other five still exist
            for assistive tech — they are rendered, empty of layout, below. */}
        <div
          {...eco.panelProps(eco.active)}
          data-open={eco.engaged ? "true" : "false"}
          className="eco-branch contents"
        >
          {active.stack.map((g, gi) => {
            const gp = polar(groupRadius(gi), gAngles[gi]);
            const tAngles = techAngles(ANCHOR, gi, groupCount, g.items.length);
            return (
              <div key={g.group} className="contents">
                <GroupPill
                  label={g.group}
                  hue={active.hue}
                  delay={60 + gi * 55}
                  style={{ left: `${gp.x}%`, top: `${gp.y}%` }}
                />
                {g.items.map((t, ti) => {
                  const tp = polar(LEVEL_3_RADIUS, tAngles[ti]);
                  return (
                    <TechNode
                      key={`${g.group}-${t.name}`}
                      tech={t}
                      delay={150 + gi * 55 + ti * 28}
                      style={{ left: `${tp.x}%`, top: `${tp.y}%` }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* The five closed panels, kept in the accessibility tree so the
            tablist contract holds even though they are not drawn. */}
        {CAPABILITIES.map((c, i) =>
          i === eco.active ? null : (
            <div key={c.k} {...eco.panelProps(i)} className="hidden" />
          ),
        )}
      </div>

      <EcosystemList capabilities={CAPABILITIES} idPrefix={idPrefix} />
    </>
  );
}
