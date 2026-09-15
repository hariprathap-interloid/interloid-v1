import type { Metadata } from "next";
import { pageMeta } from "@/content/seo";
import Answers from "@/components/Answers";
import Clauses from "@/components/Clauses";
import CtaAnchor from "@/components/CtaAnchor";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import PullQuote from "@/components/PullQuote";
import Reveal from "@/components/Reveal";
import WeekStrip from "@/components/WeekStrip";
import WhyHero from "@/components/WhyHero";
import { WHY_QUOTE } from "@/content/site";

export const metadata: Metadata = pageMeta(
  "/why-choose-us",
  "Why Interloid: the commitments we put in writing",
  "The terms we put in writing: 100% code ownership, fixed or transparent pricing, senior engineers only, weekly working demos and 30 days of support.",
);

/* Why Interloid: the claim, the five clauses as a document, proof, a normal
   week, objections, and the ask.
   Copy marked data-placeholder is unverified; confirm before public launch. */
export default function WhyChooseUs() {
  return (
    <>
      <Reveal />
      <Nav />
      <main id="main">
        <WhyHero />

        <Clauses />
        <WeekStrip />

        <PullQuote
          quote={WHY_QUOTE.q}
          name={WHY_QUOTE.name}
          role={WHY_QUOTE.role}
          link={WHY_QUOTE.link}
        />

        <Answers />

        {/* Unique id per page so in-page anchors never collide. */}
        <CtaAnchor
          id="hold-us"
          eyebrow="Hold us to it"
          headline="Hold us"
          accent="to all of it."
          lead={
            "Book 30 minutes and test every clause on this page against your project. " +
            "If the honest answer is “don’t hire us,” that is the answer you’ll get."
          }
          meta={[
            "No obligation",
            "No sales pressure",
            "Written price in 48 hours",
          ]}
        />
      </main>
      <Footer />
    </>
  );
}
