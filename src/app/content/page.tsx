import type { Metadata } from "next";
import BriefHero from "@/components/brief/BriefHero";
import LetterComposer from "@/components/brief/LetterComposer";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Tell us your story — start a project | Interloid",
  description:
    "Skip the form. Tell us about your project in your own words — three blanks if you're in a rush, the full story if you have a few minutes — and watch it become a letter as you type. An engineer reads every word. A free 30-minute call, then a written scope and price within 48 hours.",
};

/* ==========================================================================
   /content — "Tell us your story". Added 2026-09-11.
   ==========================================================================
   The project enquiry. Every "Let's talk" and "Book a free 30-min consult"
   button on the site leads here.

     BriefHero        the promise and the three facts (the first layout's
                      hero, restored at the user's request)
     LetterComposer   questions on one side, the letter writing itself on
                      the other (chosen in /content-lab)

     content/brief.ts          the words and the field list
     brief/useStoryBrief.ts    draft, versions, validation, send
     app/content/actions.ts    the send

   STILL OPEN, and decided on /content-lab: which side the questions sit on,
   the phone design (drawer · tabs · echo), and the animation (none · mark ·
   team · blueprint · envelope). Each is one prop below; the defaults are
   questions-left, drawer, no animation.

   No CtaAnchor slab: this page IS the conversion, and a second "book a call"
   button under the letter would compete with its own send button. */
export default function Content() {
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
        <BriefHero />
        <LetterComposer />
      </main>
      <Footer />
    </>
  );
}
