import type { Metadata } from "next";
import CtaAnchor from "@/components/CtaAnchor";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";
import ApproachPrinciples from "@/components/service/ApproachPrinciples";
import CapabilityShowcase from "@/components/service/CapabilityShowcase";
import EcosystemSection from "@/components/service/EcosystemSection";
import EngagementPanel from "@/components/service/EngagementPanel";
import { ModeProvider } from "@/components/service/ModeContext";
import ProblemLedger from "@/components/service/ProblemLedger";
import ServiceHero from "@/components/service/ServiceHero";
import { SERVICE_START } from "@/content/service";

export const metadata: Metadata = {
  title: "Services — build it with us, or extend your team | Interloid",
  description:
    "Web and mobile development, backend and APIs, cloud infrastructure and DevOps, AI integration and staff augmentation. Built from scratch in your own accounts, or senior engineers embedded in your team on contract. Written scope and price within 48 hours.",
};

/* ==========================================================================
   /services — rebuilt 2026-09-08.
   ==========================================================================
   Research: SERVICE-PAGE-RESEARCH.md at the repo root — the four Converse
   service pages driven with Playwright, with the patterns worth taking (§2),
   where they are weak (§3), and what this page does instead (§4). Nothing is
   copied from them; what is taken is the principle that a service page
   should draw the mechanism rather than describe the offering.

   ── THE NARRATIVE ────────────────────────────────────────────────────────
     ServiceHero          what we do + which of the two buyers you are. The
                          choice is the hero's right-hand object, and it drives
                          the rest of the page.
     ProblemLedger        five sentences a client actually says, each opening
                          onto a concrete answer.
     CapabilityShowcase   the six live services, each drawn as a working
                          mechanism in a sticky panel that follows the read.
     ApproachPrinciples   the method — with the last line of each principle
                          written for the mode you picked.
     EngagementPanel      the terms of that mode, before anything is asked.
     EcosystemSection     the stack, as a three-level map. LAST, and outside
                          the provider: it is proof, not part of the offer.
     CtaAnchor            the consult, on the site's standard dark slab.

   ── WHAT WAS REMOVED, AND WHY ────────────────────────────────────────────
   `ServiceTerms` — "the same five terms, either way" — was cut 2026-09-08.
   It said nothing the page had not already said. Counted on the running page:
   "weekly working demo" appeared in five sections, "48 hours to a written
   price" in four, "30 days' notice" in four, "your IP / your accounts" in
   three — and `terms` was one of the sources in every one of those rows. All
   five of its figures are stated as full sentences in `engagement`
   immediately above it, two of them a third time in `approach` above that,
   and the set is a 1:1 restatement of the five clauses that are the whole of
   /why-choose-us. Even "8–12 yrs per engineer, no juniors" is already the
   first outcome bullet of the Staff Augmentation capability.

   `ServiceTerms.tsx` and `SERVICE_TERMS` are KEPT and merely uncalled, the
   same way TechStacks is: restoring the section is an import and a line.

   ── ARCHITECTURE ─────────────────────────────────────────────────────────
   `ModeProvider` is the only Client boundary that spans sections; four
   sections read the mode from it. ServiceTerms is a Server Component passed
   through as a child, so it ships as HTML even though it sits inside the
   provider — the boundary crosses at the sections that need state, not at
   the page.

   Components live in `src/components/service/` and are written against the
   TYPES in `src/content/service.ts`, not against this page's data: a second
   service page later is another content object plus a route, with no
   component changes.

   ── SECTION GROUNDS ──────────────────────────────────────────────────────
   secondary → background → secondary → background → secondary → the CTA's
   light band. Each section owns its own ground and `border-t`.

   ── CLAIMS ───────────────────────────────────────────────────────────────
   The content is interloid.com's OWN #services and #technologies sections,
   read with Playwright on 2026-09-08 at the user's instruction. Its outcome
   bullets carry performance numbers that are not on HANDOFF §7's allowed
   list ("save 40%", "99.99% uptime SLA", "50+ deploys a day", "60% fewer
   support tickets", "SOC 2 / HIPAA"), so each of those renders under
   `data-placeholder` and is listed in service.ts's banner. Two live claims
   CONTRADICTED verified ones and were reconciled to the verified figure
   rather than flagged — the 30-60 day timeline and "10+ years" experience.
   The $25k–$90k range was removed from this page on request.
   ========================================================================== */
export default function Services() {
  return (
    <>
      <Reveal />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-200 focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:font-semibold focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <ModeProvider>
          <ServiceHero />
          <ProblemLedger />
          <CapabilityShowcase />
          <ApproachPrinciples />
          <EngagementPanel />
        </ModeProvider>

        {/* THE STACK, LAST. Moved out from between the services and the
            method on 2026-09-08: it is a proof section, not part of the
            offer, and the ecosystem map is the most striking thing on the
            page — it closes better than it interrupts. Outside ModeProvider
            because it reads no mode.

            CHOSEN: "Connected constellation", circle group nodes. Every level
            is a node joined to its parent by a drawn edge, and it is the only
            layout with real edges at all three depths. Compare them all on
            /service-variants. */}
        <EcosystemSection variant="constellation-circle" />

        {/* `id="start"`, not "contact": the nav and the footer both point at
            `/#contact` on HOME, and a duplicate id here would make those
            links ambiguous depending on which page you were on — the same
            reasoning as /careers' `id="apply"`. */}
        <CtaAnchor
          id="start"
          eyebrow="Start here"
          headline="Tell us what's stuck."
          accent="We'll tell you if we can help."
          lead="Thirty minutes, no obligation. We assess feasibility, rough timeline and budget — and if this doesn't need us, or needs someone else, you hear that on the call."
          cta="Book a free 30-min consult"
          meta={SERVICE_START}
        />
      </main>
      <Footer />
    </>
  );
}
