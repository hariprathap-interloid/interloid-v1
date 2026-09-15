import type { Metadata } from "next";
import { pageMeta } from "@/content/seo";
import AboutHero from "@/components/about/AboutHero";
import Origin from "@/components/about/Origin";
import People from "@/components/about/People";
import Place from "@/components/about/Place";
import Shape from "@/components/about/Shape";
import Team from "@/components/about/Team";
import CtaAnchor from "@/components/CtaAnchor";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = pageMeta(
  "/about",
  "About: a small engineering firm in Tamil Nadu",
  "Interloid is a product-engineering company in Gobichettipalayam, Tamil Nadu. No bench, no account managers, no juniors on your project, no lock-in.",
);

/* About: company, origin, structure, who you work with, team roster, location.
   Section grounds alternate secondary/background; each section owns its ground.
   Copy marked data-placeholder is unverified; confirm before public launch. */
export default function About() {
  return (
    <>
      <Reveal />
      <Nav />
      <main id="main">
        <AboutHero />
        <Origin />
        <Shape />
        <People />
        <Team />
        <Place />

        {/* Unique id per page so in-page anchors never collide. */}
        <CtaAnchor
          id="talk"
          eyebrow="No sales call"
          headline="Ask us the thing"
          accent="you can't ask a vendor."
          lead="Whether the last agency burned you, whether the budget is real, whether this should be built at all. Thirty minutes with an engineer, and you will get the honest answer even when it costs us the work."
          cta="Book a free 30-min consult"
          meta={["No obligation", "No sales pressure", "Written price in 48 hours"]}
        />
      </main>
      <Footer />
    </>
  );
}
