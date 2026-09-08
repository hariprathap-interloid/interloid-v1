import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Careers — trainee developer roles for freshers | Interloid",
  description:
    "Four on-site trainee developer roles in Gobichettipalayam for freshers: React, Ruby on Rails, Python and Node.js. Six months of training, then real client work. Every term on one page.",
};

/* ==========================================================================
   /careers — built 2026-09-07, REBUILT 2026-09-08.
   ==========================================================================
   The first version was senior, remote, market-rate hiring. The user corrected
   the facts on 2026-09-08 and the correction changed the page rather than its
   numbers: these are FRESHER roles, ON SITE, with a six-month training period
   and a two-year agreement. Senior hiring is closed.

   It also got shorter, on request. Nine sections became six:

     CareersHero  the offer stated, plus the four facts that decide whether
                  the rest of the page is worth anybody's time
     Programme    the two years in order — replaces the commitment grid, the
                  stack grid AND the first-90-days block
     Roles        four trainee roles, stack shown as ICONS, one Apply each
     LifeHere     the bento, added on request 2026-09-08. No photographs yet:
                  every tile has an `img` field, all null, and renders a
                  designed panel until a real file lands in public/life/. The
                  copy is checkable rather than three adjectives
     HiringPath   three steps, plus what will never happen to you
     FitCheck     who should not apply, with the terms named plainly
     CareerFaq    the awkward questions, before the first call
     CtaAnchor    the open application

   `CandidateOffer`, `CareerStack` and `FirstNinety` were deleted rather than
   left unrendered — their content lives in Programme and in the role cards
   now, and a dead component is a trap for whoever reads this next. What was
   NOT deleted is the senior role data: it is parked in site.ts as
   SENIOR_ROLES, exported and unrendered, with a note on how to bring it back.
   Roles.tsx states in one line that senior hiring is closed, which is worth
   more than silence — a senior reader who finds only trainee roles otherwise
   concludes we do not employ seniors, contradicting every client page.

   ── HOW IT RELATES TO THE REFERENCE ──────────────────────────────────────
   conversedatasolutions.com/careers was read with Playwright before any of
   this was written; its structure, and the two parts we deliberately do not
   reproduce (the invented photography, the unfalsifiable values triad), are
   recorded in site.ts's careers banner. No copy, class or layout is taken
   from it, and the rewrite has moved this page further from it still.

   ── SECTION GROUNDS ALTERNATE ────────────────────────────────────────────
   secondary → background → background → secondary → background → secondary →
   background, then the CTA's light band. Programme and Roles still share
   `background` on purpose: they are one argument (here are the terms, here
   are the ways in) and a band change between them would read as a subject
   change.

   HiringPath moved to `background` when LifeHere was inserted 2026-09-08.
   It had shared `secondary` with FitCheck, which was a preference rather than
   an argument; keeping that pairing would have put three secondary sections
   in a row. Each section owns its own ground and its own `border-t`, so the
   rhythm is changed in the component, never by wrapping one here.

   ⚠ CLAIM STATUS — READ BEFORE PUBLISHING. Everything about the terms is
   unverified and flagged: the twelve-hour training days, the ₹10,000 monthly
   stipend, the two-year agreement, the three-day reply, "no training fee", and
   whether these four roles are open at all. HANDOFF §7's allowed-claims list
   covers CLIENT commitments; none of it transfers to employment terms.

   Two carry more than the usual risk and were flagged to the user on
   2026-09-08: the twelve-hour day is a Shops & Establishments Act exposure as
   well as a recruiting one, and the stipend plus the agreement are the terms a
   candidate screenshots. They must match the real offer letter, word for word,
   before this page is public. Every one of them reads from TERMS in site.ts,
   so correcting one is a single edit and cannot leave a stale copy behind.
   ========================================================================== */
export default function Careers() {
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
        <CareersHero />
        <Programme />
        <Roles />
        <LifeHere />
        <HiringPath />
        <FitCheck />
        <CareerFaq />

        {/* The open application. Same slab as home's, different words — every
            prop defaults to home's copy, so this is a parameterisation and not
            a second component (see CtaAnchor's note).

            `id="apply"`, not "contact": the nav and footer both point at
            `/#contact` on HOME, and a duplicate id here would make those links
            ambiguous depending on which page you were on. */}
        <CtaAnchor
          id="apply"
          eyebrow="Still reading?"
          headline="Send us something"
          accent="you have built."
          lead="A college project, a half-finished app, a script that automates something small. It does not have to be good — it has to be yours, and you have to be able to talk about how you made it."
          cta="Apply for a trainee role"
          href="mailto:hello@interloid.com?subject=Trainee%20application"
          meta={[
            "No application fee, ever",
            "No portal, no account",
            "Everybody hears back",
          ]}
        />
      </main>
      <Footer />
    </>
  );
}
