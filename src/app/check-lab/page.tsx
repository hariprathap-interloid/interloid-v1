import type { Metadata } from "next";
import Footer from "@/components/Footer";
import CheckVariants from "@/components/lab/CheckVariants";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Check-mark variants — pick one | Interloid",
  robots: { index: false, follow: false },
};

/* ==========================================================================
   /check-lab — every candidate for the site's tick, switched in place.
   ==========================================================================
   Raised 2026-09-12: the plain Lucide check appears in ELEVEN components, and
   at that density it reads as texture rather than as "verified". This page
   exists to settle what replaces it BEFORE eleven files are edited.

   The specimen set, the three real contexts it is judged against, and the
   note on what adopting each one actually costs are all in
   components/lab/CheckVariants.tsx.

   No <Reveal /> here on purpose: the reveal vocabulary sets [data-reveal]
   nodes to opacity 0 until an observer fires, and a lab whose whole subject
   is a 400ms draw-on animation should not also be fading its own rows in —
   the two motions would be judged as one.

   Not linked from anywhere, noindex. Delete this route and the component
   together with the losing variants once one is chosen.
   ========================================================================== */
export default function CheckLab() {
  return (
    <>
      <Nav />
      <main id="main" className="pt-32">
        <div className="shell">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-strong">
            Internal · not linked · noindex
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium leading-[1.1] tracking-[-0.025em] text-foreground md:text-5xl">
            Which tick?
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-[1.6] text-muted-foreground">
            The plain check is used in eleven components. Pick the mark that
            still reads as <em>verified</em> at that density — in a dense list,
            in prose, and on the dark slab, where the palette is different.
          </p>
        </div>
        <CheckVariants />
      </main>
      <Footer />
    </>
  );
}
