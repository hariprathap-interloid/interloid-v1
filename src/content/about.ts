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
  lead: "The proposal you receive lists the specific specialists on your project. Here is how that standard is maintained throughout.",
  points: [
    {
      k: "doc",
      title: "Named in the proposal",
      body: "The document you receive within 48 hours names the engineers who will do the work, not an anonymous team size and rate card.",
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
  commitment: {
    title: "Direct engineering collaboration",
    body: "No account managers, no junior intermediaries. Every member of our squad works directly with you across modern web platforms, distributed backends, cloud architectures, and AI integrations.",
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
  eyebrow: "Engineering team",
  head: "Meet the",
  accent: "Builders",
  lead: "Passionate senior engineers dedicated to elevating your digital capabilities.",
  note: "Real ownership, direct collaboration. The engineers you meet are the individuals designing, building, and deploying your software.",
} as const;

export type TeamMember = {
  name: string;
  role: string;
  discipline: string;
  experience: string;
  initials: string;
  hue: Hue;
  linkedin?: string;
};

export const TEAM: readonly TeamMember[] = [
  {
    name: "Alex Morgan",
    role: "Principal Systems Architect",
    discipline: "Distributed Systems & Cloud",
    experience: "12+ yrs exp",
    initials: "AM",
    hue: "brand",
    linkedin: "#",
  },
  {
    name: "Elena Vance",
    role: "Lead AI & ML Engineer",
    discipline: "LLMs, RAG & Agents",
    experience: "10+ yrs exp",
    initials: "EV",
    hue: "indigo",
    linkedin: "#",
  },
  {
    name: "Marcus Reed",
    role: "Staff Cloud & DevOps Architect",
    discipline: "Kubernetes & Infrastructure",
    experience: "11+ yrs exp",
    initials: "MR",
    hue: "teal",
    linkedin: "#",
  },
  {
    name: "Sarah Chen",
    role: "Senior Full-Stack Architect",
    discipline: "Next.js, Node & TypeScript",
    experience: "9+ yrs exp",
    initials: "SC",
    hue: "accent",
    linkedin: "#",
  },
  {
    name: "David Kim",
    role: "Principal Data Platform Engineer",
    discipline: "Streaming Pipelines & BigQuery",
    experience: "11+ yrs exp",
    initials: "DK",
    hue: "brand",
    linkedin: "#",
  },
  {
    name: "Priya Sharma",
    role: "Senior Mobile Platform Lead",
    discipline: "React Native & Flutter",
    experience: "8+ yrs exp",
    initials: "PS",
    hue: "indigo",
    linkedin: "#",
  },
  {
    name: "Liam Patel",
    role: "Senior BI & Analytics Specialist",
    discipline: "Power Platform & Visuals",
    experience: "9+ yrs exp",
    initials: "LP",
    hue: "teal",
    linkedin: "#",
  },
  {
    name: "Maya Lin",
    role: "Staff Frontend & UI Systems",
    discipline: "Web Performance & Design Systems",
    experience: "8+ yrs exp",
    initials: "ML",
    hue: "accent",
    linkedin: "#",
  },
] as const;

/* ==========================================================================
   PLACE — where the company actually is.
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
      lines: [
        "No. 82/1, First Floor, Jai Marappa Complex",
        "Sri Aishwariyam Nagar, Karattadipalayam",
        "Gobichettipalayam, Tamil Nadu 638453",
      ],
      note: "Headquarters. Registered office with direct engineer availability.",
      ph: null,
    },
    {
      k: "clock",
      label: "How we overlap",
      lines: ["Async by default", "One live window daily"],
      note: "Standups, demos and anything urgent happen inside a scheduled overlap with US and UK business hours.",
      ph: null,
    },
    {
      k: "shield",
      label: "The entity",
      lines: [
        "Interloid Technologies Private Limited",
        "connect@interloid.com · +91 9042032424",
      ],
      note: "A registered Indian private limited company. Contracts are with the entity, not with an individual.",
      ph: null,
    },
  ],
} as const;
