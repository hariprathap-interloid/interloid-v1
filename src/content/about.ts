import type { Hue } from "./site";

/* ==========================================================================
   /about — content. Added 2026-09-08.
   ==========================================================================
   Its own file rather than another block in site.ts, following the precedent
   `service.ts` already set: site.ts is past a thousand lines and holds home,
   /why-choose-us and /careers between them. CLAUDE.md §2's rule is that copy
   lives in `src/content/` and never in a component; which file inside it is a
   filing decision, and one page per file is the one this project has drifted
   to on its own.

   ── BUILT AFTER READING conversedatasolutions.com/about WITH PLAYWRIGHT ───
   That page is: hero → "Why We Exist" (three flip cards, problem front /
   solution back) → "Meet the Squad" (SIXTEEN named colleagues with
   photographs, in a carousel) → a technology marquee → "The Rhythm of Our
   Work" (a four-panel process accordion) → "The Ecosystem" (a radial orbit
   diagram) → CTA.

   NONE of that structure is reproduced, and three of its six sections could
   not be even if we wanted them:

     · MEET THE SQUAD is the centre of gravity of their page and the one thing
       this site cannot answer in kind. HANDOFF §7 P1: "Do not launch with
       invented people." Sixteen stock portraits with invented names is the
       precise failure the review names — asking for trust while showing no
       proof — and it is worse here than a fake testimonial, because a person
       is easier to check than a quote. So this page answers the question that
       section exists to answer ("who will I actually work with?") with the
       facts we DO have, and says plainly why there are no photographs yet.
     · THE PROCESS ACCORDION would duplicate home's `#process` and
       /why-choose-us' week strip.
     · THE ECOSYSTEM DIAGRAM already exists on /services.

   What is left is the part no other page on this site covers: why the company
   exists, how it is shaped, who is in the room, and where the room is.

   ⚠ CLAIM STATUS. The allowed-claims list in site.ts is about ENGAGEMENT
   commitments; almost nothing on an About page is on it. Anything historical
   (a founding year, a headcount, a client count, an origin anecdote) is
   unverifiable from here and is either absent or `data-placeholder`. What is
   stated as fact is limited to: the legal entity name, the location, the
   engagement commitments already cleared on 2026-09-06, and statements about
   how the firm is SHAPED that the user can confirm in one reading.
   ========================================================================== */

export const ABOUT_HERO = {
  eyebrow: "About Interloid",
  head: "A small firm that",
  accent: "answers for its own work.",
  lead: "Interloid Technologies Private Limited is a product-engineering company in Gobichettipalayam, Tamil Nadu. We build software for people who have been let down by a previous vendor, and most of how we work is a reaction to that.",
  cta: "How we engage",
  href: "/services",
} as const;

/* The hero strip. Four things a stranger wants settled in the first ten
   seconds — what kind of company, where, how big, and how to reach it.
   `ph` marks the ones that are not verifiable from here. */
export const ABOUT_FACTS = [
  {
    k: "code",
    label: "Product engineering",
    body: "Web, mobile, cloud and data work",
    ph: null,
  },
  {
    k: "layers",
    label: "Gobichettipalayam",
    body: "Tamil Nadu, India · one office",
    ph: null,
  },
  {
    k: "users",
    label: "Small and senior",
    body: "Engineers with 8–12 years each",
    ph: null,
  },
  {
    k: "clock",
    label: "US & UK overlap",
    body: "A live window every working day",
    ph: "P1: confirm the geography framing and the overlap window",
  },
] as const satisfies readonly {
  k: string;
  label: string;
  body: string;
  ph: string | null;
}[];

/* ==========================================================================
   ORIGIN — the narrative.

   Written as PROSE rather than as tiles, because it is the one thing on this
   site that is genuinely a story and tiles would chop it into slogans. It is
   also the section type the site does not have yet (DS §3.4, long-form
   article typography), so it earns its place on a page whose whole job is to
   sound like a person rather than a brochure.

   ⚠ THE HARD PART, AND READ THIS BEFORE EDITING. Every sentence here is about
   what the company BELIEVES and how it OPERATES — both checkable in one call
   — and not one of them asserts a historical fact. There is no founding year,
   no "we started when…", no headcount, no client story. That is not modesty;
   it is that none of it can be verified from here, and an origin story is the
   easiest place on a website to write fiction without noticing. If the user
   supplies real history, it goes in as its own paragraph WITH a date, not by
   loosening these. */
export const ORIGIN = {
  eyebrow: "Why we exist",
  head: "Most of this company is a",
  accent: "reaction to bad experiences.",
  body: [
    "Almost every client who calls us has been through it once already. A fixed price that moved. A team that was senior in the pitch and junior by the second sprint. A codebase they could not read, in an account they did not control, with a vendor who had to be present for anything to be deployed.",
    "None of that is exotic. It is the normal shape of the industry, and it is profitable — a client who cannot leave is a client who renews. We decided to build the company that is bad at that: everything in your accounts from the first commit, the price in writing before the work, the same engineers throughout, and a working demo every Friday whether or not the week went well.",
    "The consequence is that we are small, and we intend to stay small enough that the person you speak to is the person who writes the code. That is not a growth strategy. It is the only way the rest of it stays true.",
  ],
  /* The pull-out beside the narrative. Every figure is on site.ts's allowed
     list — these are the engagement commitments, restated as the shape of the
     company rather than as a sales promise. */
  glance: {
    title: "At a glance",
    rows: [
      { label: "Legal entity", value: "Interloid Technologies Private Limited" },
      { label: "Where", value: "Gobichettipalayam, Tamil Nadu, India" },
      { label: "What", value: "Product engineering — build, and embedded teams" },
      { label: "Price", value: "In writing within 48 hours of the first call" },
      { label: "Ownership", value: "100% of the code and IP, yours throughout" },
      { label: "Notice", value: "30 days, either direction" },
    ],
  },
} as const;

/* ==========================================================================
   SHAPE — how the company is built, including what it deliberately lacks.

   Five statements, each falsifiable in one conversation. The absences matter
   more than the presences: "there is no account manager" is checkable on the
   first call, where "we value communication" is not.

   Deliberately NOT a values list and NOT a second commitments grid —
   /why-choose-us owns the commitments and repeating them here would make two
   pages argue the same point. These are about the org chart, not the contract.
   ========================================================================== */
export const SHAPE = [
  {
    k: "users",
    hue: "brand",
    title: "There is no bench",
    body: "Nobody here is waiting to be assigned. It is why we take on fewer projects than we are asked to, and why we will tell you when the answer is “not this quarter”.",
    ph: "P1: confirm there is no bench",
  },
  {
    k: "phone",
    hue: "accent",
    title: "There is no account manager",
    body: "There is no layer between you and the engineer. Nobody translates your requirement into a ticket and your estimate back into a promise.",
    ph: null,
  },
  {
    k: "user-check",
    hue: "light",
    title: "There are no juniors on your project",
    body: "Engineers here have 8–12 years each, and the people on your discovery call are the people in your repository. That is in the engagement, not just on this page.",
    ph: null,
  },
  {
    k: "split",
    hue: "teal",
    title: "There is no sales team",
    body: "The first call is with somebody who would do the work, which is why it is also the call where we tell you if you should hire somebody else.",
    ph: "P1: confirm there is no sales function",
  },
  {
    k: "key-round",
    hue: "indigo",
    title: "There is no lock-in of any kind",
    body: "No proprietary framework, no licensed component, no credential we hold and you do not. Leaving costs one conversation, because there is nothing of yours in our hands to return.",
    ph: null,
  },
] as const satisfies readonly {
  k: string;
  hue: Hue;
  title: string;
  body: string;
  ph: string | null;
}[];

/* ==========================================================================
   PEOPLE — the section that replaces "Meet the Squad".

   The reference page answers "who will I work with?" with sixteen portraits.
   We cannot, and the honest substitute is to answer the same question with
   the four things that are actually true and checkable, then say plainly why
   there are no faces here yet.

   ── WHY THE DISCLOSURE IS ON THE PAGE AT ALL ─────────────────────────────
   Because the alternative is a silence a reader fills in for themselves, and
   they fill it in worse than the truth. A site whose entire argument is "we
   tell you the awkward thing first" cannot have a conspicuous gap where every
   competitor has photographs and say nothing about it.

   It is `data-placeholder` for a reason that runs the other way from most of
   the flags on this project: this copy should be DELETED, not confirmed, the
   day real bios and permissioned photographs exist. Until then it is the
   honest version. Do not soften it into "our team is growing".
   ========================================================================== */
export const PEOPLE = {
  eyebrow: "Who you work with",
  head: "You will know their names",
  accent: "before you sign anything.",
  lead: "Not from a page like this one — from your proposal, which lists the individuals on your project by name.",
  points: [
    {
      k: "doc",
      title: "Named in the proposal",
      body: "The document you receive within 48 hours names the engineers who will do the work, not a team size and a rate card.",
    },
    {
      k: "repeat",
      title: "The same people throughout",
      body: "Any change of personnel goes through you, in writing, before it happens — including ours.",
    },
    {
      k: "monitor-play",
      title: "In the room every Friday",
      body: "The demo is presented by whoever built the thing being demonstrated. There is no presenting layer.",
    },
    {
      k: "search",
      title: "Reachable directly",
      body: "Your questions go to the engineer doing the work, inside the overlap window, without a ticket in between.",
    },
  ],
  /* The honest gap. See the banner. Now introduces the roster below rather
     than standing alone — the two have to be read together or the roster
     looks like a team page with the names missing by accident. */
  gap: {
    title: "Why there are no photographs here",
    body: "Because we do not have permission to publish them yet, and a page of stock portraits with invented names would be the exact thing this site spends every other page arguing against. The roster below is the real shape of the team; the names arrive in your proposal, and you can ask for that before you commit to anything.",
  },
} as const;

/* ==========================================================================
   TEAM — the roster. Added 2026-09-08 on request.
   ==========================================================================
   The user asked for the equivalent of the reference page's "Meet the Squad"
   after being told twice that HANDOFF §7 blocks it. CLAUDE.md §8 is explicit
   about what happens next: flag once, then build, and mark it. This is the
   build.

   ── EXTENDED 2026-09-08: PHOTOGRAPHS, POSITIONS AND LINKEDIN ─────────────
   The user asked for the full people card — a photograph, the position, and a
   LinkedIn link — and for a section that an EMPLOYEE feels good arriving at,
   not only a buyer. That is what TEAM_HEADING's `note` is for; it is the one
   piece of copy on this site written for the team rather than for a client.

   Three nullable fields now, and they are INDEPENDENT on purpose: `name`,
   `img`, `linkedin`. A name usually lands before a photograph and a
   photograph before somebody agrees to be linked, so the card is built to
   render correctly at every combination rather than only at "all or nothing".

   ── THE `null` DESIGN, AND WHY IT IS NOT A COP-OUT ───────────────────────
   Every seat below is null on all three today. The card renders "Named in
   your proposal" in the name slot, which is a true statement and already the
   promise made three sections up.

   The alternative was to invent seven people. That is the one thing the
   review names as disqualifying, and it is worse here than the placeholder
   testimonials already in site.ts: a quote from "Placeholder Name" is
   obviously a placeholder, whereas a plausible Indian name under a plausible
   job title reads as a real colleague to every visitor who is not looking for
   the trick. There is no honest way to write that string.

   So the component is built to work in every state and switch on the fields.
   The day real details exist they are typed in here — one line per person, no
   component change, no layout change — and each placeholder disappears on its
   own as its field is filled.

   ⚠ PHOTOGRAPHS MUST BE OF THESE PEOPLE, WITH THEIR PERMISSION. Not stock, and
   not scraped from anywhere. Same rule as the careers gallery, and it matters
   more here: a stock portrait under a real colleague's job title is worse than
   no photograph, and the colleague will be the first to notice.

   ── ROLES ARE INTERLOID'S, NOT THE REFERENCE'S ───────────────────────────
   Their roster is Data/BI/Power Platform because that is their business.
   These map to what /services actually publishes — web, mobile, backend,
   cloud, AI integration — so the roster and the service list corroborate each
   other instead of describing two different companies.

   ⚠ WHICH SEATS ACTUALLY EXIST IS UNVERIFIED. The grid carries
   data-placeholder for that, separately from the names. A roster is a
   headcount claim in disguise: seven cards say "there are at least seven of
   us" whether or not the page uses the number. Confirm the real seats before
   this is public, and delete the ones that do not exist rather than leaving
   them nameless. */
export const TEAM_HEADING = {
  eyebrow: "The team",
  /* Chosen from the /team lab 2026-09-08 (option "c"). It beat "Passion, hard
     work and a lot of collaboration" for the reason this site keeps landing
     on: the winner NAMES the adjectives and then trades them for something
     checkable. A Friday demo in front of the client is a habit a stranger can
     verify; passion is not. The rejected options and the lab are deleted. */
  head: "A small team with",
  accent: "one standard of work.",
  lead: "Passion and hard work are claims; a Friday demo in front of the client every single week is a habit. These are the people who keep it.",
  /* The closing line is aimed at THE TEAM, not at a buyer — the user asked
     for a section that an employee feels good arriving at. It is the only
     copy on the site with that audience, so it is the only place the voice is
     allowed to be warm rather than falsifiable. */
  note: "If your face is on this page, it is because the work has your name on it. Thank you for the last release, and the one before that.",
} as const;

export type TeamMember = {
  k: string;
  hue: Hue;
  role: string;
  owns: string;
  /** null until a real, permissioned name exists. */
  name: string | null;
  /** Filename in `public/team/`. Every seat currently carries committed
   *  PLACEHOLDER art (`ph-1.svg` … `ph-7.svg`) — abstract silhouettes,
   *  unmistakably not people — so the section reads photo-first today.
   *  Swapping in the real photograph is still a one-field edit, and
   *  `.about.mjs` asserts only `ph-*.svg` appears until then. */
  img: string | null;
  /** Full profile URL, or null — the chip simply does not render. */
  linkedin: string | null;
};

export const TEAM = [
  {
    k: "key-round",
    hue: "brand",
    role: "Founder & Principal Engineer",
    owns: "Sets the architecture, and is on your first call — the same person, not a handover.",
    name: null,
    img: "ph-1.svg",
    linkedin: null,
  },
  {
    k: "monitor-play",
    hue: "accent",
    role: "Engineering Lead",
    owns: "Owns the sprint, the Friday demo and the estimate you were given.",
    name: null,
    img: "ph-2.svg",
    linkedin: null,
  },
  {
    k: "code",
    hue: "light",
    role: "Senior Full-stack Engineer",
    owns: "React and Next.js at the front, Node or Python behind it, typed end to end.",
    name: null,
    img: "ph-3.svg",
    linkedin: null,
  },
  {
    k: "layers",
    hue: "indigo",
    role: "Backend & API Engineer",
    owns: "The contracts everything else leans on, and the migrations that run both ways.",
    name: null,
    img: "ph-4.svg",
    linkedin: null,
  },
  {
    k: "cloud",
    hue: "teal",
    role: "Cloud & Platform Engineer",
    owns: "Terraform in your accounts, CI on every push, and a runbook your team can follow.",
    name: null,
    img: "ph-5.svg",
    linkedin: null,
  },
  {
    k: "phone",
    hue: "brand",
    role: "Mobile Engineer",
    owns: "React Native, both stores, and the release train that survives a rejection.",
    name: null,
    img: "ph-6.svg",
    linkedin: null,
  },
  {
    k: "sparkle",
    hue: "teal",
    role: "Data & AI Engineer",
    owns: "Pipelines with lineage, and model-backed features with evaluation and a cost ceiling.",
    name: null,
    img: "ph-7.svg",
    linkedin: null,
  },
] satisfies readonly TeamMember[] as readonly TeamMember[];

/* Widened on purpose (2026-09-08): with every `img` now a literal filename,
   `as const` narrowed the fields so far that the null branches in Team.tsx
   became `never` and stopped compiling — the type was encoding "placeholders
   forever". The annotation keeps the SHAPE strict and the VALUES swappable,
   which is the whole point of the three-field switch. */

/* The eighth card. A roster that ends in an open seat says something a roster
   of seven cannot: that the company is still forming, and that the reader
   could be in it. It also makes /careers reachable from the one page a
   candidate is most likely to land on from a search for the company name. */
export const TEAM_OPEN = {
  title: "And four seats we are trying to fill",
  body: "Trainee roles in React, Ruby on Rails, Python and Node — on site, with six months of training.",
  cta: "See the open roles",
  href: "/careers",
} as const;

/* ==========================================================================
   PLACE — where the company actually is.

   The review flags a GEOGRAPHY CONTRADICTION as a live P1: the live site's
   meta says "Based in US & UK" while the only address is Tamil Nadu and the
   only phone number is +91. This section is where that gets settled in the
   open rather than papered over, so the framing line carries the flag.
   ========================================================================== */
export const PLACE = {
  eyebrow: "Where we are",
  head: "One office, and we",
  accent: "say which country it is in.",
  lead: "Plenty of firms our size present as American or British and route the work elsewhere. We are an Indian company with Indian engineers, and clients in the US and UK who know that on the first call.",
  cards: [
    {
      k: "layers",
      label: "The office",
      lines: ["Gobichettipalayam", "Tamil Nadu, India"],
      note: "One location. There is no second office and no delivery centre.",
      ph: "confirm the full address before publishing",
    },
    {
      k: "clock",
      label: "How we overlap",
      lines: ["Async by default", "One live window daily"],
      note: "Standups, demos and anything urgent happen inside a scheduled overlap with US and UK business hours.",
      ph: "P1: confirm the overlap window and publish the actual hours",
    },
    {
      k: "shield",
      label: "The entity",
      lines: ["Interloid Technologies", "Private Limited"],
      note: "A registered Indian private limited company. Contracts are with the entity, not with an individual.",
      ph: "confirm registration number / CIN before publishing it",
    },
  ],
} as const;
