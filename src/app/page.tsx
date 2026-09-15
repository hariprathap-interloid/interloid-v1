import type { Metadata } from "next";
import Advantage from "@/components/Advantage";
import CtaAnchor from "@/components/CtaAnchor";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import Process from "@/components/Process";
import PullQuote from "@/components/PullQuote";
import Reveal from "@/components/Reveal";
import Testimonials from "@/components/Testimonials";
import Work from "@/components/Work";
import { pageMeta } from "@/content/seo";

/* Home: hero, why Interloid, process, work, testimonials, quote, FAQ, CTA.
   Positioning, proof and conversion; service detail lives on /services. */
export const metadata: Metadata = {
  ...pageMeta(
    "/",
    "Senior product engineering",
    "Interloid is a senior product-engineering team. Defined problems to deployed software, in your accounts, on your repos.",
  ),
  title: { absolute: "Interloid: Senior product engineering" },
};

export default function Home() {
  return (
    <>
      <Reveal />
      <Nav />
      <main id="main">
        <Hero />
        <Advantage />
        <Process />
        <Work />
        <Testimonials />
        <PullQuote />
        <Faq />
        <CtaAnchor />
      </main>
      <Footer />
    </>
  );
}
