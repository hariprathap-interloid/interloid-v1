/* Site-wide copy and data. Components render these arrays directly, so copy
   changes belong here rather than in components.

   Claims stated as fact: free 30-min consult · 48-hr written proposal ·
   weekly working demo · 30 days post-launch support · 30-day notice ·
   100% code/IP ownership · $25k–$90k build range · 2-15 week first version
   (14–20 larger) · engineers with 2-15 years each · no juniors substituted
   after signing. Anything else stays data-placeholder until confirmed. */

/* `Tech` is defined in service.ts so /careers and /services share one shape.
   The two files import types from each other; that cycle is safe only while
   both stay `import type`. If either becomes a value import, move the shared
   types into a third file. */
import type { Tech } from "./service";

export type Hue = "brand" | "accent" | "light" | "indigo" | "teal";

/* One hue per category, reused wherever that category appears.

   Every class must be a whole, literal string, including variant prefixes
   (`group-hover:`) and opacity suffixes (`/10`). Tailwind scans source for
   complete class names, so a class assembled at runtime is silently dropped.
   Add a new variant as its own field; never derive one from another. */
export const HUE: Record<
  Hue,
  {
    tile: string;
    soft: string;
    softHover: string;
    solidHover: string;
    ring: string;
    text: string;
    glow: string;
  }
> = {
  brand: {
    tile: "bg-brand",
    soft: "bg-brand/10",
    softHover: "group-hover:bg-brand/20",
    solidHover: "group-hover:bg-brand",
    ring: "ring-brand/15",
    text: "text-brand",
    glow: "bg-brand/10",
  },
  accent: {
    tile: "bg-accent",
    soft: "bg-accent/10",
    softHover: "group-hover:bg-accent/20",
    solidHover: "group-hover:bg-accent",
    ring: "ring-accent/15",
    text: "text-accent-strong",
    glow: "bg-accent/10",
  },
  light: {
    tile: "bg-brand-light",
    soft: "bg-brand-light/10",
    softHover: "group-hover:bg-brand-light/20",
    solidHover: "group-hover:bg-brand-light",
    ring: "ring-brand-light/15",
    text: "text-brand-light",
    glow: "bg-brand-light/10",
  },
  indigo: {
    tile: "bg-indigo-600",
    soft: "bg-indigo-600/10",
    softHover: "group-hover:bg-indigo-600/20",
    solidHover: "group-hover:bg-indigo-600",
    ring: "ring-indigo-600/15",
    text: "text-indigo-600",
    glow: "bg-indigo-600/10",
  },
  teal: {
    tile: "bg-teal-600",
    soft: "bg-teal-600/10",
    softHover: "group-hover:bg-teal-600/20",
    solidHover: "group-hover:bg-teal-600",
    ring: "ring-teal-600/15",
    text: "text-teal-600",
    glow: "bg-teal-600/10",
  },
};

/* ==========================================================================
   COMMITMENTS — the "Why Interloid" tiles, shared by home and /why-choose-us.

   The count is load-bearing. In the three-column grid the first and last
   tiles span two columns (Advantage derives this from the array length), so
   only 5 or 7 tiles fill every row; any other count leaves a hole.

       [ wide (0) .......... ][ 1 ]
       [ 2 ][ 3 ][ 4 ]
       [ 5 ][ wide (6) .......... ]
   ========================================================================== */
export const BENTO = [
  {
    k: "key-round",
    hue: "brand",
    span: "",
    title: "You own 100% of the code",
    body: "Every repo, every credential, every architecture decision transfers to you. No proprietary framework, no licence, no hostage situation. It’s in the contract, not just on this page.",
  },
  {
    k: "receipt",
    hue: "indigo",
    span: "",
    title: "Fixed price or transparent hourly",
    body: "You know the number before we start. Scope changes are quoted, never surprise-invoiced.",
  },
  {
    k: "user-check",
    hue: "light",
    span: "",
    title: "Senior engineers only",
    body: "The people on your call are the people writing the code. No bait-and-switch to juniors after signing.",
  },
  {
    k: "split",
    hue: "teal",
    span: "",
    title: "We tell you when to walk away",
    body: "If your project doesn’t need us, or needs someone else, we say so on the first call.",
  },
  {
    k: "phone",
    hue: "accent",
    span: "",
    title: "Small team, direct line",
    body: "You talk to the engineer building your feature, not an account manager relaying messages to a pod.",
  },
  {
    k: "monitor-play",
    hue: "accent",
    span: "",
    title: "A working demo every week",
    body: "Not a status report. Software you can click, every week, from week one.",
  },
  {
    k: "buoy",
    hue: "teal",
    span: "",
    title: "30 days of post-launch support",
    body: "Included. We stay on after go-live, because that is when real usage finds things.",
  },
] as const satisfies readonly {
  k: string;
  hue: Hue;
  span: string;
  title: string;
  body: string;
}[];

/* ==========================================================================
   HOW WE WORK — the four steps.

   Each `when` chip restates a commitment made elsewhere on the site. The chip
   upper-cases in CSS; store it sentence case.
   ========================================================================== */
export const STEPS = [
  {
    k: "search",
    n: "01",
    title: "Discovery call",
    when: "30 minutes",
    body: "A free, no-pressure call. We assess feasibility, rough timeline and budget, and tell you if you don’t need us.",
  },
  {
    k: "doc",
    n: "02",
    title: "Written proposal",
    when: "48 hours",
    body: "Scope, milestones and a fixed price or transparent hourly rate. In writing, so you can compare it against anyone else.",
  },
  {
    k: "code",
    n: "03",
    title: "Build in the open",
    when: "Weekly demos",
    body: "Short sprints with a working demo every week. You have access to the repo and the board from day one.",
  },
  {
    k: "rocket",
    n: "04",
    title: "Launch & handover",
    when: "30-day support",
    body: "We ship it, document it and hand over the keys. 30 days of support included, then a retainer only if you want one.",
  },
];

/* Placeholder case studies, rendered data-placeholder. Real, anonymised
   case studies are required before launch. */
export const CASES = [
  {
    sector: "Logistics",
    hue: "brand",
    title: "Case study one",
    body: "What the problem was, what shipped, and the one number that moved.",
  },
  {
    sector: "Fintech",
    hue: "teal",
    title: "Case study two",
    body: "What the problem was, what shipped, and the one number that moved.",
  },
  {
    sector: "Health",
    hue: "indigo",
    title: "Case study three",
    body: "What the problem was, what shipped, and the one number that moved.",
  },
] as const satisfies readonly {
  sector: string;
  hue: Hue;
  title: string;
  body: string;
}[];

/* ==========================================================================
   FAQ

   The price, timeline and seniority figures are confirmed claims and answer
   the questions that block a booking; keep them specific.
   ========================================================================== */
export const FAQ = [
  {
    q: "How long until we launch?",
    a: "A focused first version is typically 2-15 weeks. Larger platforms run 14–20. We work in short sprints with a working demo every week, so you see progress rather than waiting for a reveal.",
  },
  {
    q: "Who actually writes the code?",
    a: "Senior engineers with 2-15 years of experience each. The people on your discovery call are the people on your project. We don’t swap in juniors after the contract is signed.",
  },
  {
    q: "What happens if we want to leave?",
    a: "You take everything. All code, infrastructure, documentation and credentials are yours throughout, not handed over at the end. There is no notice period on ownership and nothing is licensed back to you.",
  },
  {
    q: "You’re in India. How does that work across timezones?",
    a: "We keep deliberate overlap with US and UK business hours for standups, demos and anything urgent. Async by default, with a guaranteed live window every working day.",
  },
  {
    q: "Can you work with our existing team and codebase?",
    a: "Yes, that’s most of our staff-augmentation work. We join your repo, your board and your review process rather than running a parallel track.",
  },
];

/* ==========================================================================
   TESTIMONIALS

   Placeholder drafts that hold the design. Every card and the pull-quote
   render data-placeholder; replace with real, permissioned quotes before
   launch.
   ========================================================================== */
export const QUOTES = [
  {
    q: "They pushed back on half our original scope and were right about all of it. We shipped smaller and sooner than we planned.",
    n: "Placeholder Name",
    r: "VP Product, Placeholder Co",
    i: "PN",
  },
  {
    q: "The handover was the most complete I have received from any vendor. Our team picked it up without a single follow-up call.",
    n: "Placeholder Name",
    r: "CTO, Placeholder Co",
    i: "PN",
  },
  {
    q: "Weekly demos meant no surprises. We knew exactly where we were the entire build.",
    n: "Placeholder Name",
    r: "Founder, Placeholder Co",
    i: "PN",
  },
];

/* Name and role are separate fields so the name can be emphasised without
   markup in the content layer. */
export const PULL_QUOTE = {
  q: "The weekly demo changed how our own team works. We stopped writing status reports and started showing the thing.",
  name: "Placeholder Name",
  role: "Head of Product, Placeholder Co",
};

/* ==========================================================================
   /why-choose-us
   ==========================================================================
   CLAUSES asserts these terms are "carried into every engagement agreement".
   That line in the Clauses footer, and WHY_HERO.kicker which restates it,
   render data-placeholder until checked against the actual contract.
   ========================================================================== */

/* `ctaHref` goes to the contact page; `subHref` is a bare fragment because
   #agreement is on this page. */
export const WHY_HERO = {
  eyebrow: "Why Interloid",
  head: "Clarity from day one. Progress every week.",
  accent: "No surprises at the end.",
  lead: "Most technology partners promise transparency, senior engineers, flexibility, and partnership. We believe those words only matter when they become measurable commitments. That’s why every Interloid engagement is backed by clear terms covering ownership, people, pricing, visibility, and exit, from the first commit through 30 days after launch.",
  body: "Your code and infrastructure stay in your accounts. The engineers you meet are the engineers working on your project. Pricing is agreed before work begins, progress is demonstrated every week, and you always retain control of the work and the accounts it lives in.",
  kicker:
    "These aren’t promises for a sales deck. They’re commitments carried into every engagement agreement.",
  cta: "Book a free 30-min consult",
  /* Below `sm`, where the full label wrapped inside the pill. */
  ctaShort: "Book a free consult",
  ctaHref: "/contact#story",
  sub: "Read the agreement",
  subHref: "#agreement",
};

export const CLAUSES = [
  {
    n: "01",
    label: "Ownership",
    title: "Everything is yours from the first commit",
    body: "Work happens in your GitHub organisation and your cloud accounts. Code, infrastructure, credentials and documentation are yours throughout; there is no handover ceremony at the end because there is nothing of yours in our hands.",
    figure: "100%",
    caption: "code & IP, yours",
  },
  {
    n: "02",
    label: "People",
    title: "The engineers you meet are the engineers you get",
    body: "The proposal names the individuals on your project. They are the people on your discovery call, and later in your standups. Any change of personnel goes through you, in writing, before it happens.",
    figure: "Named",
    caption: "in the proposal",
  },
  {
    n: "03",
    label: "Price",
    title: "The number comes before the work",
    body: "A fixed price or a transparent hourly rate, in writing within 48 hours of the first call. Scope changes are quoted and approved before work continues. Nothing is billed that you haven't approved in advance.",
    figure: "48 hrs",
    caption: "to a written price",
  },
  {
    n: "04",
    label: "Visibility",
    title: "You watch progress; you don't request updates",
    body: "A working demo every week, plus standing access to the repository and the sprint board. A bad week surfaces in that week's demo, never in a month-end surprise.",
    figure: "Weekly",
    caption: "working demo",
  },
  {
    n: "05",
    label: "Exit",
    title: "Leaving must cost you nothing",
    body: "Because everything already lives in your accounts, walking away takes one conversation; there is nothing to migrate, export or unwind. Every build includes 30 days of post-launch support; a retainer after that is an option, never a dependency.",
    figure: "30 days",
    caption: "support included",
  },
] as const;

/* `hi` marks Friday. The demo is the ceremony the whole week is built around,
   so it is the one card that is not neutral. */
export const WEEK = [
  {
    tag: "Monday",
    title: "Standup, in your channel",
    body: "The week's plan lands in your Slack or Teams, written by the engineers, not summarised by a manager.",
    hi: false,
  },
  {
    tag: "Tue – Wed",
    title: "PRs into your repo",
    body: "Reviews in the open. Your team can comment, question and learn from every change as it happens.",
    hi: false,
  },
  {
    tag: "Thursday",
    title: "Blockers, raised early",
    body: "Anything at risk for the demo is flagged now, with options, not excuses.",
    hi: false,
  },
  {
    tag: "Friday",
    title: "The working demo",
    body: "Software you can click, plus a short written summary. The ceremony the whole week is built around.",
    hi: true,
  },
  {
    tag: "Anytime",
    title: "A direct line",
    body: "Questions go to the engineer doing the work, in your timezone overlap. No relay, no ticket queue.",
    hi: false,
  },
] as const;

/* Rendered open, not in an accordion: hiding the awkward questions behind a
   click is the behaviour the section argues against. */
export const ANSWERS = [
  {
    q: "Where are you actually based?",
    a: "Gobichettipalayam, Tamil Nadu, India, and we keep deliberate overlap with US and UK business hours for standups, demos and anything urgent. Async by default, with a scheduled live window every working day.",
  },
  {
    q: "Who actually writes the code?",
    a: "Senior engineers, named in your proposal. The people on your discovery call are the people in your repo; there's no swap to a junior bench after signature, because we don't have one.",
  },
  {
    q: "We already have a team. Does that work?",
    a: "It's most of what we do. Our engineers work inside your repo and your rituals, not alongside them, and step out with 30 days' notice once you've hired.",
  },
  {
    q: "What does it cost?",
    a: "A fixed price or a transparent hourly rate, in writing within 48 hours of the first call. If budget and scope do not line up, you hear it on that call, and if the honest number is smaller than you planned to spend, you hear that too.",
  },
  {
    q: "How long until we launch?",
    a: "A focused first version is typically 2-15 weeks; larger platforms run 14–20. You see a working demo every week from the first sprint, so the date is something you watch converge, not something you take on faith.",
  },
  {
    q: "What happens if we want to leave?",
    a: "You take everything, because you had everything all along: code, infrastructure, documentation and credentials live in your accounts throughout. Nothing is licensed back to you, every build includes 30 days of post-launch support, and leaving takes one conversation.",
  },
] as const;

/* Deliberately a different quote from PULL_QUOTE, chosen to support this
   page's argument. Placeholder until a real, permissioned quote exists. */
export const WHY_QUOTE = {
  q: "Six months after handover we haven’t needed them once, which, strangely, is exactly why we’d hire them again.",
  name: "Placeholder Name",
  role: "CTO, Placeholder Co",
  link: { label: "See the work behind the words", href: "/#work" },
} as const;

/* ==========================================================================
   /careers — trainee roles, on site.
   ==========================================================================
   None of these terms is on the confirmed-claims list. Items carrying `ph`
   are unverified and render data-placeholder. The training hours, stipend and
   agreement term must match the actual offer letter, and the hours must be
   checked against Tamil Nadu Shops & Establishments Act limits, before this
   page is public.
   ========================================================================== */

/* The terms, in one place. Every component that states a term reads it from
   here, so correcting the training hours or the stipend is a one-line edit and
   cannot leave a stale copy behind on another section. */
export const TERMS = {
  location: "Gobichettipalayam, Tamil Nadu",
  mode: "On site, full time",
  who: "Freshers and up to 1 year of experience",
  training: "6 months",
  trainingHours: "12 hours a day",
  stipend: "₹10,000 / month",
  stipendPeriod: "fixed for the first year",
  agreement: "2 years",
} as const;

/* The hero strip. Four facts, and they are the four that decide whether
   somebody keeps reading — location, who it is for, what the training is, and
   the money. Nothing softened: a candidate who finds out about the hours on
   call four has been wasted, and so have we. */
export const CAREER_FACTS = [
  {
    k: "layers",
    label: "On site only",
    body: TERMS.location,
    ph: null,
  },
  {
    k: "user-check",
    label: "Freshers welcome",
    body: "0–1 year. No prior job needed",
    ph: null,
  },
  {
    k: "clock",
    label: "6-month training",
    body: `${TERMS.trainingHours} through training`,
    ph: "P1: confirm the training hours are lawful and correctly worded",
  },
  {
    k: "receipt",
    label: TERMS.stipend,
    /* Kept short enough to stay on one line at the cell width. */
    body: `Fixed year one · ${TERMS.agreement} agreement`,
    ph: "P1: confirm stipend and agreement against the offer letter",
  },
] as const satisfies readonly {
  k: string;
  label: string;
  body: string;
  ph: string | null;
}[];

/* ==========================================================================
   PROGRAMME — the two-year agreement as a timeline, in order.
   ========================================================================== */
export const PROGRAMME = [
  {
    tag: "Months 1–6",
    note: "The hard part",
    title: "Training",
    body: `Twelve-hour days, on site, learning one stack properly: fundamentals, the codebase, code review, and how a real client project runs. It is the hardest part and we are not going to pretend otherwise.`,
    ph: "P1: confirm the training hours are lawful and correctly worded",
  },
  {
    tag: "Months 7–12",
    note: "Supervised",
    title: "Real work, supervised",
    body: `You move onto a client project with a senior engineer reviewing everything you write. Your stipend is ${TERMS.stipend}, fixed across the whole first year.`,
    ph: "P1: confirm stipend against the offer letter",
  },
  {
    tag: "Year 2",
    note: "Independent",
    title: "On the team",
    body: "You own features, you attend the client demo, and you are reviewed on the same terms as everybody else. The agreement runs two years in total; what happens at the end of it is a conversation, not a clause.",
    ph: "P1: confirm the second-year salary and what confirmation means",
  },
] as const satisfies readonly {
  tag: string;
  /** The one-word state of this phase, shown beside the numbered node. */
  note: string;
  title: string;
  body: string;
  ph: string | null;
}[];

/* Summary under the timeline. Split into figure + label so the row scans in
   one pass. */
export const PROGRAMME_META = [
  { figure: TERMS.training, label: "of training", ph: null },
  {
    figure: TERMS.stipend.replace(" / month", ""),
    label: "a month, year one",
    ph: "P1: confirm stipend",
  },
  {
    figure: TERMS.agreement,
    label: "agreement",
    ph: "P1: confirm agreement term",
  },
  { figure: "Full time", label: "on site, five days", ph: null },
] as const;

/* ==========================================================================
   ROLES — trainee roles.

   `tech` renders as logos through TechLogo. Every `file` must exist in
   `public/tech/`: a missing file renders a blank plate, not a visible error.
   Compensation is identical across roles and lives in TERMS.
   ========================================================================== */
export const ROLES = [
  {
    id: "trainee-react",
    title: "React Developer (Trainee)",
    hue: "brand",
    track: "Frontend",
    tech: [
      { name: "React.js", file: "reactjs.svg" },
      { name: "TypeScript", file: "typescript.svg" },
      { name: "Tailwind CSS", file: "tailwindcss.svg" },
      { name: "Git", file: "git.svg" },
    ],
    summary:
      "Build the screens people actually use. You will learn components, state and accessibility on a real client product rather than on a to-do app.",
    look: [
      "You have built something in JavaScript, even a small one, and can walk us through it.",
      "You can read an error message to the end before asking.",
    ],
  },
  {
    id: "trainee-rails",
    title: "Ruby on Rails Developer (Trainee)",
    hue: "accent",
    track: "Backend",
    tech: [
      { name: "Ruby on Rails", file: "rails.svg" },
      { name: "PostgreSQL", file: "postgresql.svg" },
      { name: "Git", file: "git.svg" },
      { name: "Docker", file: "docker.svg" },
    ],
    summary:
      "Learn the framework that made most of the web's conventions. Models, migrations, background jobs, and why the boring answer is usually right.",
    look: [
      "You are comfortable with the command line, or willing to be within a week.",
      "You would rather understand one thing properly than four things partly.",
    ],
  },
  {
    id: "trainee-python",
    title: "Python Developer (Trainee)",
    hue: "teal",
    track: "Backend · Data",
    tech: [
      { name: "Python", file: "python.svg" },
      { name: "PostgreSQL", file: "postgresql.svg" },
      { name: "Git", file: "git.svg" },
      { name: "Docker", file: "docker.svg" },
    ],
    summary:
      "APIs, data pipelines and the model-backed features on top of them. The stack where a careful, methodical person gets good fastest.",
    look: [
      "You have written Python outside a classroom exercise.",
      "You check the number before you report it.",
    ],
  },
  {
    id: "trainee-node",
    title: "Node.js Developer (Trainee)",
    hue: "indigo",
    track: "Backend",
    tech: [
      { name: "Node.js", file: "nodejs.svg" },
      { name: "TypeScript", file: "typescript.svg" },
      { name: "PostgreSQL", file: "postgresql.svg" },
      { name: "Git", file: "git.svg" },
    ],
    summary:
      "The server side of the products the React trainees build. Routes, databases, authentication, and what happens when two requests arrive at once.",
    look: [
      "You know what an HTTP request is well enough to explain it to a friend.",
      "You are not put off by something being hard for the first fortnight.",
    ],
  },
] as const satisfies readonly {
  id: string;
  title: string;
  hue: Hue;
  track: string;
  tech: readonly Tech[];
  summary: string;
  look: readonly string[];
}[];

/* ==========================================================================
   PATH — how we hire. A conversation and a day of real work in the office,
   because the job is in the office.
   ========================================================================== */
export const PATH = [
  {
    k: "doc",
    n: "01",
    title: "Send anything that shows you code",
    when: "Reply in 3 days",
    body: "A CV, a GitHub link, a college project, a screenshot of something you built. A cover letter is optional and there is no account to create. Everyone gets an answer, including a no.",
  },
  {
    k: "phone",
    n: "02",
    title: "A conversation, with an engineer",
    when: "45 minutes",
    body: "Not a quiz. We talk about something you have made and how you went about it, and you get to ask us what the two years are really like.",
  },
  {
    k: "handshake",
    n: "03",
    title: "A day with us, then an offer",
    when: "In writing",
    body: "You spend a day in the office on a small real task, so you see the room and the hours before you commit. The offer states the stipend, the training and the agreement in full.",
  },
] as const;

/* The counter-list: things a fresher in this market is genuinely wary of. */
export const PATH_NO = [
  "No training fee, ever: we pay you, not the other way round",
  "No certificate-course upsell",
  "No ghosting: everybody hears back",
] as const;

/* Two fit lists. Each line carries its own icon naming what it is about.
   Icon rows also keep the columns close in height: five short YES rows
   roughly match four taller NO rows. */
export const FIT_YES = [
  {
    k: "rocket",
    t: "You want to be taught properly, and you will do the hours it takes.",
  },
  { k: "layers", t: "You can get to Gobichettipalayam every working day." },
  { k: "code", t: "You would rather learn one stack deeply than sample four." },
  { k: "users", t: "You take a code review as help rather than as criticism." },
  {
    k: "phone",
    t: "You ask early instead of being stuck quietly for two days.",
  },
] as const;

/* Column headings. Keep them parallel, differing by one word, and free of
   idiom: much of the audience reads English as a second language. */
export const FIT_TITLES = {
  yes: "This job is for you if…",
  no: "This job is not for you if…",
} as const;

/* Closing line under each list. Both columns need one to stay balanced. */
export const FIT_NOTES = {
  yes: "If three of these sound like you, that is enough to apply. Nobody arrives with all five.",
  no: "None of these are character flaws; they describe a different job, and there are good ones. Deciding here costs you five minutes. Deciding in month three costs you a year.",
} as const;

export const FIT_NO = [
  {
    k: "layers",
    t: "You need remote or hybrid. This role is on site, every day; there is no version of it that is not.",
  },
  {
    k: "clock",
    t: "You cannot commit two years. The training only makes sense to us if you stay to use it.",
  },
  {
    k: "receipt",
    t: "You want a market salary in year one. It is ₹10,000 a month, fixed, and we would rather you knew now.",
  },
  {
    k: "user-check",
    t: "You are looking for a senior role. We are not hiring seniors at the moment.",
  },
] as const;

/* ==========================================================================
   GALLERY — the moments rail under "Life here" on /careers.
   ==========================================================================
   `img: null` renders a captioned frame; set it to a filename in
   `public/gallery/` to show the photograph. Photos must be real ones of this
   office, never stock. Captions describe the training floor and inherit the
   claim status of TERMS and PROGRAMME; confirm them before launch.
   ========================================================================== */
export const GALLERY = [
  {
    tag: "The floor",
    title: "One room, two benches, no partition",
    body: "Seniors and trainees on the same floor. The nearest person who knows the answer is usually within earshot.",
    img: null,
  },
  {
    tag: "Friday",
    title: "The demo everyone stands for",
    body: "Whoever built the thing presents it, trainees included. Five minutes, working software, no slides.",
    img: null,
  },
  {
    tag: "Reviews",
    title: "Pull requests read out loud",
    body: "A review is a conversation at a desk before it is a comment thread. It is the fastest way anyone here has learned to write code.",
    img: null,
  },
  {
    tag: "The board",
    title: "The week, on a wall",
    body: "What is in progress, what is blocked, and who is waiting on whom, visible from the door rather than buried in a tool.",
    img: null,
  },
  {
    tag: "Lunch",
    title: "The hour nobody schedules over",
    body: "Everyone eats at the same time. It is the only meeting of the day that has never needed an agenda.",
    img: null,
  },
  {
    tag: "Gobichettipalayam",
    title: "A commute measured in minutes",
    body: "The office is in town, not on a campus an hour out of it. Most of the team walks or rides in.",
    img: null,
  },
] as const satisfies readonly {
  tag: string;
  title: string;
  body: string;
  /** A filename in `public/gallery/`, or null for the waiting frame. */
  img: string | null;
}[];

/* LIFE — the bento. `img: null` renders a designed fallback; set a filename in
   `public/life/` to show the photograph (real photos only, never stock). All
   four tiles are unverified and render data-placeholder until confirmed. */
export const LIFE = [
  {
    k: "users",
    hue: "brand",
    /* The four `span` values define the bento layout together (see
       LifeHere.tsx). Whole class strings, never composed. */
    span: "lg:col-span-2 lg:row-span-2",
    tag: "The room",
    title: "One floor, and everyone is on it",
    body: "Seniors sit with trainees. There is no separate area for either, which is mostly why the training works: you overhear the answer to a question you had not thought to ask yet.",
    img: null,
  },
  {
    k: "monitor-play",
    hue: "accent",
    span: "lg:col-span-2",
    tag: "Friday",
    title: "The demo everyone stops for",
    body: "Client demos run at the end of the week and the office watches. In your second six months, one of them is yours to present.",
    img: null,
  },
  {
    k: "layers",
    hue: "teal",
    span: "",
    tag: "The town",
    title: "Gobichettipalayam",
    body: "Not a metro, and that is the point: a short commute, and an office people actually come to.",
    img: null,
  },
  {
    k: "clock",
    hue: "indigo",
    span: "",
    tag: "The hours",
    title: "Twelve, and we say so",
    body: "Through training the days are long. Nobody finds that out in month two.",
    img: null,
  },
] as const satisfies readonly {
  k: string;
  hue: Hue;
  span: string;
  tag: string;
  title: string;
  body: string;
  /** Filename in `public/life/`, or null for the designed fallback. */
  img: string | null;
}[];

/* Candidate FAQ. Every question here is one that would otherwise be asked on
   a call, and three of them are the awkward ones. */
export const CAREER_FAQ = [
  {
    q: "Is there any remote or hybrid option?",
    a: "No. Every role on this page is on site in Gobichettipalayam, Tamil Nadu, five days a week. Training in particular does not work remotely; most of what you learn in the first six months comes from somebody turning their screen towards you.",
  },
  {
    q: "I am a fresher with no work experience. Can I apply?",
    a: "Yes, that is who these roles are for. Up to about a year of experience is fine too. What we look for is something you have actually built, however small, and the ability to talk about how you built it.",
  },
  {
    q: "What exactly are the hours during training?",
    a: "Twelve hours a day for the first six months. It is a real commitment and it is the reason people come out of it employable, but you should decide about it now rather than in month two.",
  },
  {
    q: "What is the salary?",
    a: "₹10,000 a month, fixed for the first year, with the agreement running two years in total. Everything after the first year is set out in the offer letter and we will go through it with you before you sign anything.",
  },
  {
    q: "Do I have to pay for the training?",
    a: "No. Nothing, at any stage. We pay you a stipend from day one, there is no fee, no deposit and no course to buy. If anybody ever asks you for money in our name, it is not us.",
  },
  {
    q: "Do you have openings for experienced or senior engineers?",
    a: "Not at the moment. When senior hiring opens it will be posted on this page first; send us a note and we will tell you when it does rather than keep a role listed that does not exist.",
  },
] as const;
