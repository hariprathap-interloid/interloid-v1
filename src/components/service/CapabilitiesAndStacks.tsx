"use client";

import { useState } from "react";
import CapabilityShowcase from "./CapabilityShowcase";
import EcosystemSection from "./EcosystemSection";
// import TechStacks from "./TechStacks";  ← replaced by the ecosystem map
//     (2026-09-08). The component and its content are intentionally KEPT: to go
//     back to the six-tab stack list, restore this import and swap the two
//     elements below. Nothing else has to change — both read the same
//     CAPABILITIES data.

/* The two sections that share one piece of state: which service's stack is
   selected. A reader working through the capabilities can follow "the whole
   stack" from any block and land on THAT service's tab in #technologies,
   rather than on whichever tab was last open.

   It exists only to own that number. Both children are already Client
   Components, so this adds no boundary the page did not already have, and
   keeping the state here rather than in a context means the two sections stay
   independently usable on a future per-service page. */
export default function CapabilitiesAndStacks() {
  /* Kept while TechStacks is out of the tree: it is the state that component
     is controlled by, and re-deriving it later is more work than the two lines
     it costs to leave it. `setStackTab` still receives the capability index
     from the showcase's "the whole stack" links. */
  const [, setStackTab] = useState(0);

  return (
    <>
      <CapabilityShowcase onStackLink={setStackTab} />
      {/* The three-level ecosystem map.

          CHOSEN 2026-09-08: "Connected constellation" with circle group
          nodes. Every level is a node joined to its parent by a drawn edge,
          which is the only arrangement where the hierarchy reads without a
          caption — and the only one with real edges at all three depths, so
          it is also the only one the travelling flow means anything on.

          `branch` held this slot before it and is still in the tree: it is
          the only layout that shows every technology NAME without a hover and
          the only one whose nodes never move, and it is one string away.
          Every design is switchable side by side on /service-variants. */}
      <EcosystemSection variant="constellation-circle" />
      {/* <TechStacks active={stackTab} onChange={setStackTab} /> */}
    </>
  );
}
