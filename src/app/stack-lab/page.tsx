import type { Metadata } from "next";
import Footer from "@/components/Footer";
import StackMobileVariants from "@/components/lab/StackMobileVariants";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Technology stacks on a phone: pick one | Interloid",
  robots: { index: false, follow: false },
};

/* ==========================================================================
   /stack-lab — the "Proven technology stacks" section, five ways, at 390px.
   ==========================================================================
   Raised 2026-09-12: below `lg` the ecosystem map falls back to
   `EcosystemList` — six cards with every group open — which is correct and
   accessible and does nothing else. Measured on a 390x844 phone it is 4031px
   tall, 4.8 screens, and 19% of the whole /services page.

   DECIDED 2026-09-12: the accordion. It is live in `EcosystemList`, and the
   lab's own "Accordion" specimen renders that shipping component rather than
   a copy, so this page cannot drift from what /services actually shows.

   The other ten are kept for the phase-2 review. The specimen set, what each
   costs, and the question the page exists to settle are in
   components/lab/StackMobileVariants.tsx.

   No <Reveal /> here on purpose: the variants are judged on height and on how
   they behave under a thumb, and rows fading in on scroll would add a motion
   that none of them actually ships with.

   Not linked from anywhere, noindex. The winner replaces `EcosystemList` in
   components/service/ecosystem/parts.tsx; delete this route, the component
   and the losing variants at the same time.
   ========================================================================== */
export default function StackLab() {
  return (
    <>
      <Nav />
      <main id="main" className="pt-32">
        <div className="shell">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-strong">
            Internal · not linked · noindex
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium leading-[1.1] tracking-[-0.025em] text-foreground md:text-5xl">
            The stack section, on a phone
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-[1.6] text-muted-foreground">
            The old fallback was 4.8 phone screens of open list, a fifth of
            the whole page, with nothing to do in it. Eleven ways to spend that
            space instead, each showing the same 62 technologies. The
            accordion won and is live; the rest are kept for comparison.
          </p>
          <p className="mt-4 max-w-2xl text-[14px] leading-[1.7] text-muted-foreground">
            Judge them in the frame, then open this page on a real handset. A
            mobile layout reviewed on a desktop is being reviewed as a narrow
            column: the thumb, the reach and the cost of a scroll are all
            missing from that.
          </p>
        </div>
        <StackMobileVariants />
      </main>
      <Footer />
    </>
  );
}
