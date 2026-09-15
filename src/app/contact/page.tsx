import type { Metadata } from "next";
import { pageMeta } from "@/content/seo";
import BriefHero from "@/components/brief/BriefHero";
import LetterComposer from "@/components/brief/LetterComposer";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = pageMeta(
  "/contact",
  "Contact us: tell us your story",
  "Tell us about your project in your own words. An engineer reads every word: a free 30-minute call, then a written scope and price within 48 hours.",
);

/* Project enquiry: hero, then questions beside a letter that writes itself.
   No CTA slab: a second call-to-action would compete with the send button. */
export default function Contact() {
  return (
    <>
      <Reveal />
      <Nav />
      <main id="main">
        <BriefHero />
        <LetterComposer />
      </main>
      <Footer />
    </>
  );
}
