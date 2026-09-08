import type { Metadata } from "next";
import Answers from "@/components/Answers";
import Clauses from "@/components/Clauses";
import CtaAnchor from "@/components/CtaAnchor";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import PullQuote from "@/components/PullQuote";
import Reveal from "@/components/Reveal";
import SoundFamiliar from "@/components/SoundFamiliar";
import WeekStrip from "@/components/WeekStrip";
import WhyHero from "@/components/WhyHero";
import { WHY_QUOTE } from "@/content/site";

export const metadata: Metadata = {
  title: "Why Interloid — the commitments we put in writing",
  description:
    "The terms Interloid puts in the engagement agreement: 100% code ownership, fixed price or transparent hourly, senior engineers only, a working demo every week, and 30 days of post-launch support.",
};

/* /why-choose-us — the standalone page for the commitment set.

   ── SECTION ORDER IS THE BUYER'S SEQUENCE, 2026-09-08 ─────────────────────
   Ordered so a prospect can get from "who are you" to "book the call" without
   backtracking, each section answering the question the previous one raises:

     1  WhyHero        the claim            — every vendor sounds identical
     2  SoundFamiliar  is this me?          — four problems in the client's voice
     3  Clauses        the substance        — the five clauses, as a document
     4  PullQuote      proof                — + the only route to the case studies
     5  WeekStrip      what it looks like   — the agreement on a Tuesday
     6  Answers        objections           — the six awkward questions
     7  CtaAnchor      the ask              — book 30 minutes

   Claim → relevance → substance → proof → texture → objections → ask. The
   two conversion points are the hero and the closing slab; everything between
   them exists to remove a reason not to click one of the two.

   NOTE the commitment GRID (BENTO via CommitmentTile) is deliberately not
   here — the Clauses document says the same five things in the form the page
   argues for, and home already renders the grid through Advantage. The unused
   CommitmentTile/BENTO imports were removed 2026-09-08; do not re-add them
   expecting a rendered section.

   ── PORTED FROM prototype2-archive/why-choose-us.html, 2026-09-07 ─────────
   The page was the commitment grid and nothing else. It now carries the
   archive's full argument, rebuilt on this project's tokens rather than its
   CSS: the working agreement (Clauses), a normal week (WeekStrip), the
   straight answers (Answers), and the dark slab to close on.

   Every `kicker` in the archive ("Why Interloid", "The commitments", "Direct,
   by default", "No sales call required") is a BADGE here, on request — which
   also means each block opens the way every block on the home page opens, so
   the two pages read as one site rather than two prototypes.

   The closing slab is the home CTA component with different words, not a
   second slab. Everything it needs is a prop and every prop defaults to home's
   copy — see CtaAnchor's note on why it was parameterised instead of split.

   ⚠ HANDOFF §7 P1 is still open on this page's premise: the five commitments
   are asserted to be "carried into every engagement agreement". That must be
   VERIFIED against the real contract before launch, or the page becomes
   fabricated proof — the review flags it explicitly. Both claim lines (here
   and in the agreement's foot) are marked data-placeholder until then. */
export default function WhyChooseUs() {
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
        <WhyHero />

        {/* The archive's "Act one — the problem" (user, 2026-09-08). It sits
            between the hero and the agreement so the page argues problem →
            commitment. No `capabilitiesHref`: the answers would link into the
            /services explorer, and that route is not in the app right now —
            see the component's note. */}

        <Clauses />
        <WeekStrip />
        {/* <SoundFamiliar /> */}

        {/* The archive's proof band: one quote, then a route to the work.
            MOVED above WeekStrip 2026-09-08. It used to sit after it, on the
            reasoning that the reader had "been told a lot and shown nothing" —
            true, but that moment arrives one section EARLIER. The agreement is
            the page's central asset and its five promises are where a reader
            is most sceptical, so the proof answers them immediately instead of
            waiting behind the week. Its "see the work behind the words" link
            is also the page's only route to the case studies, and it now sits
            in the middle of the page rather than two-thirds down. */}
        <PullQuote
          quote={WHY_QUOTE.q}
          name={WHY_QUOTE.name}
          role={WHY_QUOTE.role}
          link={WHY_QUOTE.link}
        />

        {/* Operational texture, AFTER the claim has been validated: this is
            what the agreement looks like on a Tuesday. Reads as evidence
            rather than more promises now that proof precedes it. */}

        <Answers />

        {/* `id="contact"` would collide with nothing on this page, but the nav
            and footer both point at `/#contact` on HOME — so this slab gets
            its own id and the links stay unambiguous. */}
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
