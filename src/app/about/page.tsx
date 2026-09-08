import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "About — a small engineering firm in Tamil Nadu | Interloid",
  description:
    "Interloid Technologies Private Limited is a product-engineering company in Gobichettipalayam, Tamil Nadu. No bench, no account managers, no juniors on your project, and no lock-in of any kind.",
};

/* ==========================================================================
   /about — built 2026-09-08.
   ==========================================================================
   This closes the other half of HANDOFF §7's "About/Careers are linked but do
   not exist". /careers shipped 2026-09-07; this is the half that was blocked,
   and the block was specific: the review says **do not launch with invented
   people**, and an About page is normally carried by a team section.

   ── HOW THE BLOCK IS ANSWERED RATHER THAN IGNORED ────────────────────────
   conversedatasolutions.com/about was read with Playwright first. Its
   structure is hero → "Why We Exist" (three flip cards) → "Meet the Squad"
   (SIXTEEN named colleagues with photographs) → a technology marquee → a
   four-panel process accordion → a radial "Ecosystem" diagram → CTA.

   Three of those six could not be reproduced here even if the layout were
   worth copying, and the reasons are recorded in `content/about.ts`:

     · MEET THE SQUAD is the whole centre of their page and is the thing this
       site cannot answer in kind. Stock portraits with invented names would
       be the precise failure the review names, and worse than a fabricated
       testimonial — a person is far easier to check than a quote. So `People`
       answers the question that section exists to answer, with the four facts
       that are true and checkable, and then states the gap out loud.
     · THE PROCESS ACCORDION would duplicate home's `#process` and
       /why-choose-us' week strip.
     · THE ECOSYSTEM DIAGRAM already exists on /services.

   No copy, class or layout is taken from that page.

   ── THE FIVE SECTIONS, AND WHY EACH IS NOT SOMEWHERE ELSE ────────────────
   Four pages already exist, so an About page's real risk is saying again what
   /why-choose-us (the contract), /services (the work) and /careers (the hiring)
   have said. Each section here covers ground none of them touch:

     AboutHero  what kind of company, where, how big, how it overlaps
     Origin     WHY the company exists — the site's only prose section, and
                the only page that is a story rather than a specification
     Shape      the ORG CHART: five things the firm deliberately does not
                have. /why-choose-us owns the commitments; this is structure
     People     "who will I work with?" — the review's own question, and the
                one the missing team page leaves unanswered
     Team       the roster, added on request 2026-09-08. Role-first, no
                photographs, and every `name` is null today — it renders as
                "Named in your proposal" and switches to a real name from one
                field in content/about.ts. See that file's TEAM banner for why
                inventing seven people was not an option
     Place      the geography, which settles §7's live contradiction in the
                open instead of papering over it

   ── SECTION GROUNDS ALTERNATE ────────────────────────────────────────────
   secondary → background → secondary → background → secondary → background,
   then the CTA's light band. Each section owns its ground and its own
   `border-t`. `Place` moved from secondary to background when the roster was
   inserted above it, or the two would have run together as one section.

   ⚠ CLAIM STATUS. The allowed-claims list in site.ts covers ENGAGEMENT
   commitments; almost nothing on an About page is on it, so this page is
   written to need very little. There is NO founding year, NO headcount, NO
   client count and NO origin anecdote anywhere on it — not out of modesty but
   because none of it is verifiable from here, and an origin story is the
   easiest place on a website to write fiction without noticing. Six flags
   remain, and two of them run in unusual directions: `People`'s admission
   about photographs should be DELETED when real bios exist rather than
   confirmed, and `Team`'s grid is flagged because a roster is a HEADCOUNT
   CLAIM in disguise — seven cards say "there are at least seven of us"
   whether or not the page prints the number.
   ========================================================================== */
export default function About() {
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
        <AboutHero />
        <Origin />
        <Shape />
        <People />
        <Team />
        <Place />

        {/* Home's slab with different words — every prop defaults to home's
            copy, so this is a parameterisation rather than a second component
            (see CtaAnchor's note).

            `id="talk"`, not "contact": the nav and footer both point at
            `/#contact` on HOME, and a duplicate id here would make those links
            resolve differently depending on which page you were on. */}
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
