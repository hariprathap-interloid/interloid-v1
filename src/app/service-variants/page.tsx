import type { Metadata } from "next";
import EcosystemSwitcher, {
  type EcosystemDesign,
} from "@/components/service/EcosystemSwitcher";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Ecosystem designs — pick one | Interloid",
  robots: { index: false, follow: false },
};

/* ==========================================================================
   /service-variants — ONE place, every ecosystem design, switched in place.
   ==========================================================================
   This page has had three shapes. It was eight diagrams stacked down a page
   (a laboratory), then five named finalists with their trade-offs (a
   shortlist). It is now a switcher, because stacking is the wrong tool for a
   comparison: eight tall diagrams meant eight live observers and eight
   animating SVGs at once, and two layouts could only be compared by scrolling
   between them from memory. Swapped in place they land in the same position,
   so the difference between them is the only thing that moves.

   /preview, /final-preview and /circle-preview are now redundant — this page
   covers every layout either of them showed, plus the three they did not.
   They are left in the tree because `.ecosystem.mjs` and `.circles.mjs` still
   address them; delete all three with the losing designs.

   EVERY ENTRY BELOW IS ONE STRING FROM PRODUCTION: `variant` on the
   EcosystemSection in CapabilitiesAndStacks.tsx. Nothing else changes.

   Not linked, noindex.
   ========================================================================== */

/* Ordered by how seriously each is in the running, not alphabetically — the
   first entry is what the page opens on. */
const DESIGNS: EcosystemDesign[] = [
  {
    layout: "constellation",
    name: "Connected constellation",
    best: "Every level is a node and every node is joined to its parent by a drawn edge, so the hierarchy is legible without reading a word — which is the whole job of this section. It is also the only layout that carries the travelling flow at all three depths.",
    cost: "One service at a time. A visitor who wants to compare two stacks has to open each in turn.",
  },
  {
    layout: "branch",
    name: "Branch tree",
    best: "Ships on /services today. The only layout that shows every technology's NAME without a hover, and the only one whose nodes do not move when a selection is made — so nothing can slide under a resting pointer.",
    cost: "Half diagram, half panel. The wheel stops being the whole story and becomes a picker, which gives up the ecosystem feeling the reference has.",
    caveat:
      "It has no level-2 or level-3 edges — its subtree is a list — so there is nothing for the beads to travel along. Turn the flow on here and all it can do is decorate the six short core spokes, which is why it would ship with flow={false}.",
  },
  {
    layout: "tree",
    name: "Tech tree",
    best: "Nothing is hidden: all six branches and every technology are on screen at once, and the open service lights its own branch. The best answer to “what do you actually work with”.",
    cost: "It is tall, and at rest it is busy. The marks are small enough that they read as texture until you look closely.",
  },
  {
    layout: "dendrogram",
    name: "Great circle",
    best: "The whole hierarchy at once, with each wedge sized by how many technologies that service really has — so the picture is honest about where the depth is.",
    cost: "The densest of them all. It needs its full height, and on a small laptop it is the first to feel cramped.",
  },
  {
    layout: "columns",
    name: "Flow columns",
    best: "The only layout where every node at every level carries a readable name, and the one that survives a long label without wrapping.",
    cost: "A diagram plus a panel rather than one object; it gives up the ecosystem feeling the wheel has.",
  },
  {
    layout: "bloom",
    name: "Radial bloom",
    best: "The closest of all eight to the reference image. The six services hold their ring at all times and the selected subtree blooms outward inside its own angular sector while the other five recede.",
    cost: "A branch at the top of the wheel and a branch at the bottom-left are different shapes pointing in different directions, so the reader re-learns the layout six times instead of once.",
  },
  {
    layout: "magnify",
    name: "Magnify",
    best: "The selected service inflates into a disc larger than the Interloid core itself and the three levels hang off it. No selection is ever in doubt.",
    cost: "The inflating disc dominates the frame; at that scale the wheel stops reading as a wheel and the core stops being the centre of anything.",
  },
  {
    layout: "shells",
    name: "Orbit shells",
    best: "Every branch opens into the SAME sector, pointing right, so the reader learns one shape and re-uses it six times. The wheel turning is also the clearest possible signal that a selection happened — nothing else on the page moves that much.",
    cost: "Every selection moves all six services, which is a great deal of travel for one hover.",
    caveat:
      "Measured, repeatedly: because the wheel re-balances, a node genuinely slides under a resting pointer and fires a hover the guard cannot tell from a real one — the pointer has not moved, so no position test can separate the two. Two of six services fail on any harness run and which two changes between runs. It is excluded from the default harness set for this reason.",
  },
];

export default function ServiceVariants() {
  return (
    <>
      <Reveal />
      <Nav />
      <main id="main" className="pt-32">
        <header className="shell pb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-strong">
            Internal — not linked, not indexed
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-[clamp(2.2rem,4vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.03em] text-foreground">
            Eight designs for the ecosystem map. Pick one.
          </h1>
          <p className="mt-5 max-w-3xl text-[17px] leading-[1.7] text-muted-strong">
            Each is rendered in the section chrome it would really ship in, one
            at a time and always in the same place, so the only thing that
            changes between two of them is the design. Everything opens on
            hover; a tap is only needed on touch. What each is good at, what it
            costs, and anything known to be wrong with it is stated above the
            diagram.
          </p>
        </header>

        <EcosystemSwitcher designs={DESIGNS} />
      </main>
      <Footer />
    </>
  );
}
