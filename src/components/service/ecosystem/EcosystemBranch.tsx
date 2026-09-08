"use client";

import Icon from "../../Icon";
import TechLogo from "../TechLogo";
import { CAPABILITIES } from "@/content/service";
import { HUE } from "@/content/site";
import { Backdrop, Core, EcosystemList, ServiceNode, connectorPoints } from "./parts";
import { SERVICE_ANGLES, SERVICE_RADII, polar } from "./geometry";
import { useEcosystem } from "./useEcosystem";

/* ==========================================================================
   VARIANT B — BRANCH TREE
   ==========================================================================
   Level 1 is the wheel, exactly as in the reference. Levels 2 and 3 refuse to
   be radial: instead of fanning the subtree into a 116° sector, the selected
   service's children unfold as a plain left-to-right tree in the space beside
   the wheel.

   ── THE ARGUMENT FOR IT ──────────────────────────────────────────────────
   Radial placement buys spectacle and costs reading. A group label on an arc
   is rotated, cramped and competing with its neighbours; the same label in a
   column is just readable. And because the tree is orthogonal, the technology
   marks can carry their NAMES — which the radial variants cannot afford at
   any radius that fits on the page. For a section whose whole job is "here is
   what we build things with", showing the names rather than hiding them
   behind a hover is a real advantage.

   ── THE ARGUMENT AGAINST IT ──────────────────────────────────────────────
   It is half a diagram and half a panel. The wheel stops being the whole
   story and becomes a picker. If the ecosystem *feeling* of the reference is
   what matters most, this is not it.

   ── THE COMPROMISE THAT MAKES IT COHERENT ────────────────────────────────
   The wheel is smaller and sits left; the tree grows from a single curved
   edge that leaves the selected node itself, so the eye is carried from the
   wheel into the tree rather than jumping between two panels. The edge is
   redrawn per selection, which is what stops it reading as a static sidebar.
   ========================================================================== */
export default function EcosystemBranch({
  idPrefix = "branch",
}: {
  idPrefix?: string;
}) {
  const eco = useEcosystem(idPrefix);
  const points = connectorPoints(SERVICE_RADII, SERVICE_ANGLES);
  const activeCap = CAPABILITIES[eco.active];
  const techCount = activeCap.stack.reduce((n, g) => n + g.items.length, 0);
  const h = HUE[activeCap.hue];

  return (
    <>
      <div
        className="eco-stage hidden gap-10 lg:grid lg:grid-cols-12 lg:items-center"
        {...eco.stageProps}
      >
        {/* ---- the wheel ------------------------------------------------ */}
        {/* SIX columns, not five. At col-span-5 the stage is 494.7px, which
            puts the inner services 75.7px from centre - inside the core. The
            wheel needs room before it needs elegance. */}
        <div className="relative aspect-square lg:col-span-6">
          <Backdrop
          nodes={points}
          activeIndex={eco.active}
          engaged={eco.engaged}
        />
          <Core />
          {/* `absolute inset-0`, NOT `contents`. A role on a
              display:contents element is a known accessibility-tree hazard -
              the box it would have generated is what the role attaches to, and
              browsers have historically dropped the semantics entirely. The
              children are absolutely positioned anyway, so a full-bleed
              wrapper costs nothing; it is pointer-events-none so it cannot
              swallow hovers meant for the stage beneath. */}
          <div
            role="tablist"
            aria-label="Interloid services"
            aria-orientation="horizontal"
            className="pointer-events-none absolute inset-0 [&>*]:pointer-events-auto"
          >
            {CAPABILITIES.map((c, i) => {
              /* Full radius. The 0.86 shrink was a workaround for a wheel
                 that was too narrow; with six columns the orbits fit as drawn,
                 and shrinking them only pushed the inner three back onto the
                 core. Closed services do not retreat further either: in this
                 variant the subtree is not on the wheel, so nothing has to
                 make room for it. */
              const p = polar(SERVICE_RADII[i], SERVICE_ANGLES[i]);
              return (
                <ServiceNode
                  key={c.k}
                  capability={c}
                  index={i}
                  /* Closed regardless of `engaged`, unlike the radial
                     variants. This wheel shares its row with the tree, so it
                     is only ~470px wide and a 132px label pill on every node
                     overlaps its neighbours at that scale - measured. Here
                     exactly one service is labelled: the open one, which this
                     variant always has. */
                  active={i === eco.active}
                  closed={i !== eco.active}
                  nodeProps={eco.nodeProps(i)}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                />
              );
            })}
          </div>
        </div>

        {/* ---- the tree -------------------------------------------------
            All six panels stay mounted; the closed ones are `hidden`, which
            also takes them out of the tab order and the a11y tree. Never a
            conditional render — Reveal.tsx observes once on mount. */}
        <div className="lg:col-span-6">
          {CAPABILITIES.map((c, i) => (
            <div
              key={c.k}
              {...eco.panelProps(i)}
              className={i === eco.active ? "" : "hidden"}
            >
              <div className="rounded-4xl border border-border bg-card p-8 shadow-[0_30px_80px_-15px_rgba(15,23,42,.12)] ring-1 ring-foreground/5">
                <div className="mb-6 flex items-center gap-4 border-b border-hairline pb-6">
                  <span
                    className={`grid size-12 shrink-0 place-items-center rounded-2xl text-white shadow-lg ${HUE[c.hue].tile}`}
                  >
                    <Icon name={c.icon} className="size-6" />
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-bold leading-[1.25] tracking-[-0.02em] text-foreground">
                      {c.name}
                    </h3>
                    <p className="mt-0.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {c.stack.length} groups ·{" "}
                      {c.stack.reduce((n, g) => n + g.items.length, 0)} technologies
                    </p>
                  </div>
                </div>

                {/* The branch: a group per row, its marks beside it, with a
                    hairline rail on the left standing in for the edges of a
                    tree. Cheaper than drawing beziers per row and it survives
                    any number of groups. */}
                <ul className="flex flex-col gap-5">
                  {c.stack.map((g, gi) => (
                    <li
                      key={g.group}
                      className="relative pl-5"
                      style={
                        {
                          /* staggered so the rows arrive outward from the
                             wheel rather than as a block */
                          animationDelay: `${gi * 60}ms`,
                        } as React.CSSProperties
                      }
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute left-0 top-1.5 h-[calc(100%-0.5rem)] w-px ${HUE[c.hue].tile} opacity-30`}
                      />
                      <h4 className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        {g.group}
                      </h4>
                      <ul className="flex flex-wrap items-center gap-2">
                        {g.items.map((t) => (
                          <li
                            key={t.name}
                            className="flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-3 transition-colors hover:border-accent/40"
                          >
                            <TechLogo tech={t} size="sm" />
                            <span className="text-[12px] font-medium text-muted-strong">
                              {t.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          <p className={`mt-4 text-[13px] ${h.text}`}>
            {eco.pinned
              ? "Pinned — tap the service again, or press Escape, to release it."
              : "Hover or focus a service to open it; tap to keep it open."}
          </p>

          {/* THE PANEL SWAP WAS SILENT TO A SCREEN READER. The tabpanel's
              content changes but nothing announces it, so a keyboard user
              arrowing round the wheel heard only the tab names. One polite
              status line names what just opened and how big it is - not the
              panel contents, which the reader can go and read, and which as a
              live region would re-announce seventeen strings per keypress. */}
          <p role="status" aria-live="polite" className="sr-only">
            {activeCap.name}: {activeCap.stack.length} groups, {techCount}{" "}
            technologies.
          </p>
        </div>
      </div>

      <EcosystemList capabilities={CAPABILITIES} idPrefix={idPrefix} />
    </>
  );
}
