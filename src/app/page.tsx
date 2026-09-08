import Advantage from "@/components/Advantage";
import CtaAnchor from "@/components/CtaAnchor";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import PlaceholderToggle from "@/components/PlaceholderToggle";
import Process from "@/components/Process";
import PullQuote from "@/components/PullQuote";
import Reveal from "@/components/Reveal";
import Testimonials from "@/components/Testimonials";
import Work from "@/components/Work";

/* The full page, section order per PROTOTYPE3-BRIEF §2's ledger, MINUS the two
   sections removed on 2026-09-08 at the user's request:

     · "What we build" (Services.tsx, deleted) — its content is now
       CAPABILITIES on /services, where each capability gets a drawn mechanism
       instead of one line in a tab panel.
     · "Technologies we work in" (StackMarquee) — the stack is no longer a
       section anywhere. On /services the marks sit UNDER each capability's
       argument, which is the difference between technology supporting the
       story and technology being it. StackMarquee.tsx is left in the tree
       unimported: `.fidelity.mjs` measures it against prototype3, and
       deleting it would throw away the only artifact that harness compares.

   Home now runs Hero straight into Why Interloid, so it argues positioning,
   proof and conversion, and the detail lives one click away.

   Only Nav, Advantage, HeroStage, Reveal and PlaceholderToggle are Client
   Components; everything else ships as HTML with no JavaScript. */
export default function Home() {
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
      <PlaceholderToggle />
    </>
  );
}
