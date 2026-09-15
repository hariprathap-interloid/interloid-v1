import type { Metadata } from "next";
import { pageMeta } from "@/content/seo";
import CareerFaq from "@/components/CareerFaq";
import CareersHero from "@/components/CareersHero";
import CtaAnchor from "@/components/CtaAnchor";
import FitCheck from "@/components/FitCheck";
import Footer from "@/components/Footer";
import HiringPath from "@/components/HiringPath";
import LifeHere from "@/components/LifeHere";
import Nav from "@/components/Nav";
import Programme from "@/components/Programme";
import Reveal from "@/components/Reveal";
import Roles from "@/components/Roles";

export const metadata: Metadata = pageMeta(
  "/careers",
  "Careers: trainee developer roles for freshers",
  "Four on-site trainee developer roles for freshers in Gobichettipalayam: React, Ruby on Rails, Python and Node.js. Six months of training, then client work.",
);

/* Careers: the offer, the training programme, trainee roles, life here, hiring
   steps, fit check, FAQ and the open application. Programme and Roles share a
   ground on purpose: they read as one argument. Employment terms come from
   TERMS in site.ts and must match the real offer letter.
   Copy marked data-placeholder is unverified; confirm before public launch. */
export default function Careers() {
  return (
    <>
      <Reveal />
      <Nav />
      <main id="main">
        <CareersHero />
        <Programme />
        <Roles />
        <LifeHere />
        <HiringPath />
        <FitCheck />
        <CareerFaq />

        {/* Unique id per page so in-page anchors never collide. */}
        <CtaAnchor
          id="apply"
          eyebrow="Still reading?"
          headline="Send us something"
          accent="you have built."
          lead="A college project, a half-finished app, a script that automates something small. It does not have to be good. It has to be yours, and you have to be able to talk about how you made it."
          cta="Apply for a trainee role"
          ctaShort="Apply for a role"
          href="/careers/apply"
          meta={[
            "No application fee, ever",
            "Two minutes, no account",
            "Everybody hears back",
          ]}
        />
      </main>
      <Footer />
    </>
  );
}
