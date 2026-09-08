import Icon from "../Icon";
import SectionHeading from "../SectionHeading";
import EcosystemBloom from "./ecosystem/EcosystemBloom";
import EcosystemBranch from "./ecosystem/EcosystemBranch";
import EcosystemColumns from "./ecosystem/EcosystemColumns";
import EcosystemConstellation from "./ecosystem/EcosystemConstellation";
import EcosystemDendrogram from "./ecosystem/EcosystemDendrogram";
import EcosystemMagnify from "./ecosystem/EcosystemMagnify";
import EcosystemShells from "./ecosystem/EcosystemShells";
import EcosystemTree from "./ecosystem/EcosystemTree";
import { STACK_HEADING } from "@/content/service";

/* ==========================================================================
   THE ECOSYSTEM SECTION — interloid.com's #technologies content as a map.
   ==========================================================================
   Replaces the six-tab stack list on /services (TechStacks.tsx, which is left
   in the tree and merely un-called, so switching back is one line).

   Three levels, on one diagram:
     1  the six services around an Interloid core
     2  the stack groups of whichever service is open
     3  that service's technologies, as their real brand marks

   Reference: conversedatasolutions.com/about's "Connecting Seamlessly"
   ecosystem, measured with Playwright — three rings at radii 150/225/300, six
   satellites at 60° intervals at ALTERNATING radii (~170 and ~235), 56px
   tinted icon tiles with the label pill beneath, connectors drawn on from the
   core. Ours reproduces that geometry and then does the thing the reference
   does not: it opens.

   `variant` exists so /preview can render all three layouts side by side for
   a decision. /services passes the chosen one. When the choice is settled the
   losing two can be deleted, and this prop with them.
   ========================================================================== */
/* The eight layouts, each available with either group-node shape.

   `-circle` is a SUFFIX rather than a separate prop so a variant is one
   string: "constellation-circle" names a thing a person can point at, where
   {variant, circles} is a pair someone has to remember to keep together. The
   suffix is stripped to pick the component and re-read to pick the shape. */
const LAYOUTS = {
  branch: EcosystemBranch,
  constellation: EcosystemConstellation,
  bloom: EcosystemBloom,
  magnify: EcosystemMagnify,
  tree: EcosystemTree,
  dendrogram: EcosystemDendrogram,
  columns: EcosystemColumns,
  shells: EcosystemShells,
} as const;

export type EcosystemLayout = keyof typeof LAYOUTS;
export type EcosystemVariant = EcosystemLayout | `${EcosystemLayout}-circle`;

/** Splits "constellation-circle" into the layout and the group-node shape. */
function readVariant(v: EcosystemVariant): {
  Map: (typeof LAYOUTS)[EcosystemLayout];
  circles: boolean;
} {
  const circles = v.endsWith("-circle");
  const key = (circles ? v.slice(0, -"-circle".length) : v) as EcosystemLayout;
  return { Map: LAYOUTS[key], circles };
}

export default function EcosystemSection({
  variant = "bloom",
  idPrefix,
  heading = true,
  id = "technologies",
  flow = true,
}: {
  /** A layout key, optionally suffixed `-circle` for circular group nodes. */
  variant?: EcosystemVariant;
  idPrefix?: string;
  /** /preview renders its own headings per variant. */
  heading?: boolean;
  id?: string;
  /** Travelling beads on the edges. Off where a layout has too few edges to
      make the flow mean anything — see `.eco-still` in globals.css. */
  flow?: boolean;
}) {
  const { Map, circles } = readVariant(variant);
  /* Whole strings, joined — never a built class name (HANDOFF §5.1). Both
     hooks restyle every layout at once from one wrapper. */
  const hooks = [circles ? "eco-circles" : "", flow ? "" : "eco-still"]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      id={id}
      /* No `overflow-hidden` on the section — it makes the element a scroll
         container and kills `position: sticky` anywhere inside (see
         CapabilityShowcase's note and TAILWIND-MAP §4c). The orb is clipped
         by its own wrapper instead. */
      className="relative border-t border-border bg-background py-32"
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute right-0 top-1/4 size-[560px] translate-x-1/3 rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 size-[420px] -translate-x-1/3 rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="relative z-10 shell">
        {heading && (
          <SectionHeading
            eyebrow={STACK_HEADING.eyebrow}
            icon="layers"
            accent={STACK_HEADING.accent}
            lead="One core, six services, and the stack behind each of them. Open a service to see the groups it is built from and the technologies inside them."
            className="max-w-3xl"
          >
            {STACK_HEADING.head}
          </SectionHeading>
        )}

        {/* The instruction line is not decoration: a diagram that only reacts
            to hover looks broken to anyone who arrives by keyboard or touch,
            so it says all three ways in. */}
        <p
          data-reveal
          className="mb-6 flex items-center gap-2 text-[13px] text-muted-foreground lg:mb-2"
        >
          <span className="text-accent-strong">
            <Icon name="search" className="size-4" />
          </span>
          <span className="hidden lg:inline">
            Hover, tap, or focus a service with the keyboard and use the arrow
            keys — its groups and technologies open around it.
          </span>
          <span className="lg:hidden">
            Every service, with the groups and technologies behind it.
          </span>
        </p>

        {/* TWO DIVS, AND THEY MUST STAY TWO.

            Reveal.tsx adds `is-in` to the [data-reveal] element imperatively,
            from outside React. React updates a className by writing the WHOLE
            attribute, so any re-render that changes `hooks` — which is exactly
            what /service-variants does every time the design is switched —
            wipes `is-in` along with it, the connectors snap back to
            `stroke-dashoffset: 1`, and the diagram goes blank with nothing in
            the console. Measured: switching to `branch` (which adds
            `eco-still`) and back left every layout undrawn.

            So the element React owns the className of is NOT the element the
            observer writes to. Both selectors are descendant selectors, so
            nesting costs nothing. */}
        <div data-reveal style={{ "--delay": "80ms" } as React.CSSProperties}>
          <div className={hooks || undefined}>
            <Map idPrefix={idPrefix ?? variant} />
          </div>
        </div>

        <p
          data-reveal
          style={{ "--delay": "160ms" } as React.CSSProperties}
          className="mt-8 flex items-start gap-2.5 text-[15px] leading-[1.7] text-muted-foreground"
        >
          <span className="mt-0.5 shrink-0 text-accent-strong">
            <Icon name="check" className="size-5" />
          </span>
          <span>
            Every technology shown is one we run in production today. Where your
            team already has a stack, we work in it — this is what we reach for,
            not what we insist on.
          </span>
        </p>
      </div>
    </section>
  );
}
