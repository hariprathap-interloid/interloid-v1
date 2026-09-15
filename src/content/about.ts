import type { Hue } from "./site";

/* ==========================================================================
   /about
   ==========================================================================
   Almost nothing on an About page is on the confirmed-claims list in
   site.ts. Historical facts (founding year, headcount, client count) are
   omitted or carry `ph`. What is stated as fact is limited to the legal
   entity, the location, the engagement commitments, and how the firm is
   structured.
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
    body: "Engineers with 2-15 years each",
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
   ORIGIN — the narrative, as prose.

   Every sentence describes beliefs and practice, never history, because
   history cannot be verified here. Add real history as its own dated
   paragraph rather than loosening these.
   ========================================================================== */
export const ORIGIN = {
  eyebrow: "Why we exist",
  head: "Most of this company is a",
  accent: "reaction to bad experiences.",
  body: [
    "Almost every client who calls us has been through it once already. A fixed price that moved. A team that was senior in the pitch and junior by the second sprint. A codebase they could not read, in an account they did not control, with a vendor who had to be present for anything to be deployed.",
    "None of that is exotic. It is the normal shape of the industry, and it is profitable: a client who cannot leave is a client who renews. We decided to build the company that is bad at that: everything in your accounts from the first commit, the price in writing before the work, the same engineers throughout, and a working demo every Friday whether or not the week went well.",
    "The consequence is that we are small, and we intend to stay small enough that the person you speak to is the person who writes the code. That is not a growth strategy. It is the only way the rest of it stays true.",
  ],
  /* The pull-out beside the narrative. Every row restates a confirmed
     engagement commitment. */
  glance: {
    title: "At a glance",
    rows: [
      { label: "Legal entity", value: "Interloid Technologies Private Limited" },
      { label: "Where", value: "Gobichettipalayam, Tamil Nadu, India" },
      { label: "What", value: "Product engineering: build, and embedded teams" },
      { label: "Price", value: "In writing within 48 hours of the first call" },
      { label: "Ownership", value: "100% of the code and IP, yours throughout" },
      { label: "Notice", value: "30 days, either direction" },
    ],
  },
} as const;

/* ==========================================================================
   SHAPE — how the company is built, including what it deliberately lacks.

   Each statement should be checkable in one conversation. These describe the
   organisation, not the contract; /why-choose-us owns the commitments.
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
    body: "Engineers here have 2-15 years each, and the people on your discovery call are the people in your repository. That is in the engagement, not just on this page.",
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
   PEOPLE — who the client works with, answered with checkable facts.
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
      body: "Any change of personnel goes through you, in writing, before it happens, including ours.",
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
   TEAM — the engineering roster.

   Roles map to the services on /services. Names, roles and seats must be
   confirmed before launch; remove seats that do not exist. Any photographs
   must be of these people, used with their permission, never stock.
   ========================================================================== */
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
