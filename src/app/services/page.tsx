import type { Metadata } from "next";
import { pageMeta } from "@/content/seo";
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

export const metadata: Metadata = pageMeta(
  "/services",
  "Services: build it with us, or extend your team",
  "Web, mobile, backend, cloud, DevOps and AI engineering. Built from scratch in your own accounts, or senior engineers embedded in your team.",
);

/* Services: hero with the build/extend mode choice, client problems,
   capabilities, approach and engagement terms (all inside ModeProvider, the
   only client boundary spanning sections), then the stack map and the CTA.
   Copy marked data-placeholder is unverified; confirm before public launch. */
export default function Services() {
  return (
    <>
      <Reveal />
      <Nav />
      <main id="main">
        <ModeProvider>
          <ServiceHero />
          <ProblemLedger />
          <CapabilityShowcase />
          <ApproachPrinciples />
          <EngagementPanel />
        </ModeProvider>

        {/* Outside ModeProvider: it reads no mode. */}
        <EcosystemSection />

        {/* Unique id per page so in-page anchors never collide. */}
        <CtaAnchor
          id="start"
          eyebrow="Start here"
          headline="Tell us what's stuck."
          accent="We'll tell you if we can help."
          lead="Thirty minutes, no obligation. We assess feasibility, rough timeline and budget, and if this doesn't need us, or needs someone else, you hear that on the call."
          cta="Book a free 30-min consult"
          meta={SERVICE_START}
        />
      </main>
      <Footer />
    </>
  );
}
