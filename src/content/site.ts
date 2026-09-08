/* ==========================================================================
   Content — lifted from prototype3/script.js, where these arrays were written
   specifically to become `.map()` calls (TAILWIND-MAP §4). Editing copy means
   editing this file; no component changes.

   Claims allowed as fact, per HANDOFF §7 plus the 2026-09-06 confirmation:
   free 30-min consult · 48-hr written proposal · weekly working demo ·
   30 days post-launch support · 30-day notice · 100% code/IP ownership ·
   $25k–$90k build range · 8–12 week first version (14–20 larger) ·
   engineers with 8–12 years each · no juniors substituted after signing.
   Anything NOT on that list stays data-placeholder — see CASES and QUOTES.
   ========================================================================== */

/* The tech-logo shape is DEFINED IN content/service.ts and imported rather
   than redeclared: /careers and /services both render technology marks through
   the same TechLogo component, and two structurally-identical types would
   drift the first time one of them gained a field.

   This and service.ts's `import type { Hue } from "./site"` form a CYCLE, and
   it is a safe one only because both are `import type`: TypeScript erases them
   completely, so no `require` of either module ever waits on the other. If
   either side is ever changed to a value import the cycle becomes real — move
   the shared types to a third file at that point rather than untangling it. */
import type { Tech } from "./service";

export type Hue = "brand" | "accent" | "light" | "indigo" | "teal";

/* DS §2.3: one hue per category, reused wherever that category appears.

   `softHover` is a WHOLE class including its `group-hover:` prefix for the
   same reason as `glow` below — a variant prefix is as invisible to the
   scanner as a `/10` suffix if either is glued on at runtime.

   `solidHover` was added 2026-09-08 for /about's Shape tiles, which fill
   SOLID on hover rather than deepening. It exists for the same reason as
   everything else in this map: the first version of that component wrote
   `h.tile.replace("bg-", "group-hover:bg-")`, which is a class built at
   runtime and therefore invisible to the scanner — the tile would simply
   never have filled, with no error. If a variant is needed, add it here as a
   whole string; never derive one from another.

   `glow` exists ONLY because of the build. The prototype composed the blur
   colour at runtime as `${h.tile}/10`, which the Tailwind *browser CDN*
   happily generated on the fly. A compiled build scans source for complete
   class strings, so `bg-brand` + "/10" is invisible to it and the class would
   be silently dropped — the panel's glow would just vanish. Every class here
   must stay a whole, literal string. Never rebuild one by concatenation. */
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

/* The five capabilities used to live here as SERVICES, feeding home's "What
   we build" section. Both moved on 2026-09-08: the section came off the home
   page at the user's request, and the content became CAPABILITIES in
   `src/content/service.ts` where it grew the fields /services needs — a
   mechanism diagram, an imperative headline, and the deliverables list.
   Nothing imports SERVICES any more, so it is gone rather than kept in two
   places: two copies of the capability list is how the footer and the service
   page start disagreeing about what this company does. */

export const STACK = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "PostgreSQL",
  "AWS",
  "Terraform",
  "Docker",
  "Kubernetes",
  "React Native",
  "GraphQL",
];

/* ==========================================================================
   COMMITMENTS — the "Why Interloid" tiles.

   Rebuilt 2026-09-07 from prototype 1's `why` array (script.js), which is the
   design reference for this section. The three-tile home split of 2026-09-06
   is reverted: the home section now carries the full set of SEVEN, and
   /why-choose-us renders the same list rather than a longer one.

   THE COUNT IS LOAD-BEARING. Three columns, and every row must fill.
   7 tiles = 5 singles + 2 double-width = 9 slots = three full rows:

       [ wide (0) .......... ][ 1 ]
       [ 2 ][ 3 ][ 4 ]
       [ 5 ][ wide (6) .......... ]

   The wide tiles are the FIRST and LAST entries, and Advantage derives that
   from the array length — do not hard-code indices there. Changing the count
   changes the arithmetic: at 5 tiles it is one wide (2+1+1+1+1 = 6 = two
   rows), at 7 it is two. Any other count leaves a visible hole.

   Every claim is on HANDOFF §7's allowed list. */
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
    body: "You talk to the engineer building your feature — not an account manager relaying messages to a pod.",
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

/* Kept as an empty-by-design alias: the two commitments that were split out on
   2026-09-06 are back in BENTO above, and /why-choose-us imports this so the
   split can be re-made later without touching that page again. */
export const COMMITMENTS_EXTRA = [] as const satisfies readonly {
  k: string;
  hue: Hue;
  span: string;
  title: string;
  body: string;
}[];

/* ==========================================================================
   HOW WE WORK — the four steps.

   Replaced 2026-09-07 with prototype 1's `process` array verbatim (its
   script.js), which is the approved reference for this section. What changed
   and why it matters:

   TITLES ARE NOW PHRASES, NOT LABELS. "Consult / Proposal / Build / Handover"
   were nouns naming a stage; "Discovery call / Written proposal / Build in the
   open / Launch & handover" say what actually happens. "Build in the open" in
   particular is a claim, where "Build" was a category.

   THE `when` CHIP CARRIES THE COMMITMENT. "Day 0 / Within 48h / Weekly /
   +30 days" described a schedule. "30 minutes / 48 hours / Weekly demos /
   30-day support" names the thing being promised, and each one is already on
   HANDOFF §7's allowed list — they restate commitments the Why Interloid
   section makes, rather than introducing new claims. The chip upper-cases in
   CSS; store it sentence case. ========================================== */
export const STEPS = [
  {
    k: "search",
    n: "01",
    title: "Discovery call",
    when: "30 minutes",
    body: "A free, no-pressure call. We assess feasibility, rough timeline and budget — and tell you if you don’t need us.",
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

/* HANDOFF §7 makes three real, anonymised case studies a P0 launch blocker.
   Every card carries data-placeholder. Do not un-flag these. */
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
   FAQ — lifted from prototype/script.js.

   CONFIRMED AS FACT by the user 2026-09-06. These four were previously
   unverifiable and would have needed data-placeholder:
     · $25k–$90k per full build, monthly per engineer for augmentation
     · 8–12 weeks to a focused first version, 14–20 for larger platforms
     · senior engineers with 8–12 years of experience each
     · no juniors swapped in after signing

   That confirmation also closes HANDOFF §7's open P1 on pricing — the site now
   publishes a range rather than claiming transparency without one. Do not
   soften these back to qualitative language without asking; they are load-
   bearing answers to the questions that actually block a booking. */
export const FAQ = [
  {
    q: "What does a typical project cost?",
    a: "Most full builds land between $25k and $90k depending on scope. Staff augmentation runs monthly per engineer. We give you a fixed number in writing within 48 hours of the first call — and we’ll tell you upfront if your budget and scope don’t match.",
  },
  {
    q: "How long until we launch?",
    a: "A focused first version is typically 8–12 weeks. Larger platforms run 14–20. We work in short sprints with a working demo every week, so you see progress rather than waiting for a reveal.",
  },
  {
    q: "Who actually writes the code?",
    a: "Senior engineers with 8–12 years of experience each. The people on your discovery call are the people on your project. We don’t swap in juniors after the contract is signed.",
  },
  {
    q: "What happens if we want to leave?",
    a: "You take everything. All code, infrastructure, documentation and credentials are yours throughout — not handed over at the end. There is no notice period on ownership and nothing is licensed back to you.",
  },
  {
    q: "You’re in India — how does that work across timezones?",
    a: "We keep deliberate overlap with US and UK business hours for standups, demos and anything urgent. Async by default, with a guaranteed live window every working day.",
  },
  {
    q: "Can you work with our existing team and codebase?",
    a: "Yes — that’s most of our staff-augmentation work. We join your repo, your board and your review process rather than running a parallel track.",
  },
];

/* ==========================================================================
   TESTIMONIALS — §8.3.

   STILL PLACEHOLDER, and deliberately so. Every card and the pull-quote carry
   data-placeholder. A testimonials block with visible "Placeholder Name" is
   worse than no testimonials at all: an empty space reads as an early company,
   a fake quote reads as a company that fabricates proof. The quotes themselves
   are plausible drafts of what a real client might say — they are here to hold
   the design, not to ship. Replace with real, permissioned quotes before
   launch (HANDOFF §7 P0, same bucket as the case studies). */
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

/* Split into name + role on 2026-09-07: prototype2-archive's pull-quote bolds
   the name and leaves the role muted, which a single `who` string cannot
   express without markup in the content layer. Copy stays copy. */
export const PULL_QUOTE = {
  q: "The weekly demo changed how our own team works. We stopped writing status reports and started showing the thing.",
  name: "Placeholder Name",
  role: "Head of Product, Placeholder Co",
};

/* ==========================================================================
   /why-choose-us — ported from prototype2-archive/why-choose-us.html
   ==========================================================================
   Three blocks the Next page did not have: the working agreement, a normal
   week, and the straight answers. Copy is verbatim from the archive; only the
   presentation was rebuilt on this project's tokens.

   ⚠ CLAUSES CARRIES HANDOFF §7's P1 AND IT IS THE WHOLE POINT OF THE PAGE.
   The document asserts these five clauses are "carried into every engagement
   agreement". If the real contract does not say so, this is not a wording
   problem — it is fabricated proof on the one page whose entire argument is
   "don't take our word for it". The footer line is data-placeholder until
   somebody reads the actual contract. Do not un-flag it to tidy the page up.
   ========================================================================== */

/* The hero. Rewritten 2026-09-08 from user-supplied copy, replacing the
   archive's "Every vendor sounds identical." `ctaHref` is /#contact (gotcha 9
   — the section only exists on home); `subHref` is a bare fragment on
   purpose, because #agreement IS on this page.

   The copy arrived as one block with a bold opening line, two paragraphs and
   a bold close, so it maps: bold line → head/accent, paragraphs → lead/body,
   bold close → kicker.

   ⚠ `kicker` RESTATES THE §7 P1 CLAIM the Clauses foot already carries —
   "commitments carried into every engagement agreement". It is the same
   unverified assertion, now moved ABOVE THE FOLD, so WhyHero renders it
   data-placeholder. Do not un-flag either copy without reading the real
   contract; see the block comment above. Everything else here is on the
   allowed list: code and infrastructure in your accounts, the engineers you
   meet, price before work starts, weekly demonstrated progress, 30 days
   post-launch. */
export const WHY_HERO = {
  eyebrow: "Why Interloid",
  head: "Clarity from day one. Progress every week.",
  accent: "No surprises at the end.",
  lead: "Most technology partners promise transparency, senior engineers, flexibility, and partnership. We believe those words only matter when they become measurable commitments. That’s why every Interloid engagement is backed by clear terms covering ownership, people, pricing, visibility, and exit — from the first commit through 30 days after launch.",
  body: "Your code and infrastructure stay in your accounts. The engineers you meet are the engineers working on your project. Pricing is agreed before work begins, progress is demonstrated every week, and you always retain control of the work and the accounts it lives in.",
  kicker: "These aren’t promises for a sales deck. They’re commitments carried into every engagement agreement.",
  cta: "Book a free 30-min consult",
  ctaHref: "/#contact",
  sub: "Read the agreement",
  subHref: "#agreement",
};

export const CLAUSES = [
  {
    n: "01",
    label: "Ownership",
    title: "Everything is yours from the first commit",
    body: "Work happens in your GitHub organisation and your cloud accounts. Code, infrastructure, credentials and documentation are yours throughout — there is no handover ceremony at the end because there is nothing of yours in our hands.",
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
    body: "A fixed price or a transparent hourly rate, in writing within 48 hours of the first call. Scope changes are quoted and approved before work continues — nothing is billed that you haven't approved in advance.",
    figure: "48 hrs",
    caption: "to a written price",
  },
  {
    n: "04",
    label: "Visibility",
    title: "You watch progress — you don't request updates",
    body: "A working demo every week, plus standing access to the repository and the sprint board. A bad week surfaces in that week's demo — never in a month-end surprise.",
    figure: "Weekly",
    caption: "working demo",
  },
  {
    n: "05",
    label: "Exit",
    title: "Leaving must cost you nothing",
    body: "Because everything already lives in your accounts, walking away takes one conversation — there is nothing to migrate, export or unwind. Every build includes 30 days of post-launch support; a retainer after that is an option, never a dependency.",
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
    body: "The week's plan lands in your Slack or Teams — written by the engineers, not summarised by a manager.",
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
    body: "Anything at risk for the demo is flagged now — with options, not excuses.",
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

/* Open on the page, not in an accordion — the archive's own note. Hiding the
   awkward questions behind a click is the behaviour the section is arguing
   against.

   Extended 2026-09-08 after diffing against home's FAQ (user request): the
   timeline and the exit questions were answered there and not here. Both
   answers below restate only HANDOFF §7 allowed claims (8–12 / 14–20 weeks,
   ownership throughout, 30 days support). The archive's four keep their
   order; the two new ones follow. */
export const ANSWERS = [
  {
    q: "Where are you actually based?",
    a: "Gobichettipalayam, Tamil Nadu, India — and we keep deliberate overlap with US and UK business hours for standups, demos and anything urgent. Async by default, with a scheduled live window every working day.",
  },
  {
    q: "Who actually writes the code?",
    a: "Senior engineers, named in your proposal. The people on your discovery call are the people in your repo — there's no swap to a junior bench after signature, because we don't have one.",
  },
  {
    q: "We already have a team. Does that work?",
    a: "It's most of what we do. Our engineers work inside your repo and your rituals, not alongside them — and step out with 30 days' notice once you've hired.",
  },
  {
    q: "What does it cost?",
    a: "A fixed price or a transparent hourly rate, in writing within 48 hours of the first call. If budget and scope do not line up, you hear it on that call — and if the honest number is smaller than you planned to spend, you hear that too.",
  },
  {
    q: "How long until we launch?",
    a: "A focused first version is typically 8–12 weeks; larger platforms run 14–20. You see a working demo every week from the first sprint, so the date is something you watch converge — not something you take on faith.",
  },
  {
    q: "What happens if we want to leave?",
    a: "You take everything, because you had everything all along — code, infrastructure, documentation and credentials live in your accounts throughout. Nothing is licensed back to you, every build includes 30 days of post-launch support, and leaving takes one conversation.",
  },
] as const;


/* The proof quote on /why-choose-us. A DIFFERENT quote from PULL_QUOTE on
   home, and deliberately so — the archive picks one that argues the page's
   own thesis (they were not needed again) rather than repeating the home
   page's. Same P0 bucket: placeholder until a real, permissioned one exists. */
export const WHY_QUOTE = {
  q: "Six months after handover we haven’t needed them once — which, strangely, is exactly why we’d hire them again.",
  name: "Placeholder Name",
  role: "CTO, Placeholder Co",
  link: { label: "See the work behind the words", href: "/#work" },
} as const;

/* ==========================================================================
   /careers — added 2026-09-07, REWRITTEN 2026-09-08.
   ==========================================================================
   The first version described senior, remote, market-rate hiring. The user
   corrected it on 2026-09-08 and the correction changes the whole page, not
   its numbers: the vacancies are for FRESHERS, on site in Gobichettipalayam,
   with a six-month training period and a two-year agreement. Senior hiring is
   not open at all right now.

   The senior set is NOT deleted — see SENIOR_ROLES below. It is parked,
   exported and unrendered, because "not open now" is a different statement
   from "never existed" and the page says so out loud.

   ── SHORTER, ON REQUEST ───────────────────────────────────────────────────
   Nine sections became six. What went, and why it could go:
     · CandidateOffer (six commitment tiles) → folded into PROGRAMME. A
       fresher's first question is what the terms are, not what the culture is.
     · CareerStack (four grouped stack cards) → folded into the role cards as
       TECH ICONS, which is what the user asked for and costs a fifth of the
       height.
     · FirstNinety → became PROGRAMME's timeline. Same rail, different content:
       the six months that matter here are the training, not the first 90 days.
   The role filter went too. Four roles do not need one.

   ⚠ CLAIM STATUS — HARDER THAN THE FIRST VERSION. Every term below came from
   the user verbally and none of it is on HANDOFF §7's allowed-claims list.
   Two carry more than the usual placeholder risk:

     · TWELVE-HOUR DAYS. Flagged to the user on 2026-09-08: the Tamil Nadu
       Shops & Establishments Act caps daily hours well below this, so
       publishing it is a legal exposure as well as a recruiting one. Built as
       instructed, marked, and easy to reword — the string is in TERMS and
       appears nowhere else.
     · ₹10,000 / MONTH and the TWO-YEAR AGREEMENT. Both are the kind of term a
       candidate screenshots. They must match the actual offer letter before
       this page is public.
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
    /* Kept to ONE line at the cell width — this was "Fixed for year one ·
       2 years agreement", the only one of the four that wrapped. */
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
   PROGRAMME — the terms as a timeline.

   This replaces both the commitment grid and the "first 90 days" block. For a
   senior hire the interesting question is what the company promises; for a
   fresher on a two-year agreement it is what the two years actually look like,
   in order. Three phases, and the honest one is first.
   ========================================================================== */
export const PROGRAMME = [
  {
    tag: "Months 1–6",
    note: "The hard part",
    title: "Training",
    body: `Twelve-hour days, on site, learning one stack properly — fundamentals, the codebase, code review, and how a real client project runs. It is the hardest part and we are not going to pretend otherwise.`,
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
  /** The one-word state of this phase, beside the numbered node. It was a
      ternary on the index inside Programme.tsx; three strings of copy do not
      belong in a component. */
  note: string;
  title: string;
  body: string;
  ph: string | null;
}[];

/* The summary under the timeline. REWRITTEN AS FIGURES 2026-09-08.

   It was four ticked sentences on a `bg-secondary` bar, and the user's read
   was right on both counts: it was hard to scan, and sitting on a different
   ground from the cards above it made it look like a separate component that
   had drifted into the section.

   A tick plus a sentence is a list — the eye has to read all four to find the
   number it wants. Split into FIGURE + LABEL the row becomes scannable in one
   pass, which is what a summary is for, and it stops competing with the hero
   band above (icon + label + body, doing the job of context rather than
   recall). The component now gives it the cards' own surface so it reads as
   the last row of the same group. */
export const PROGRAMME_META = [
  { figure: TERMS.training, label: "of training", ph: null },
  {
    figure: TERMS.stipend.replace(" / month", ""),
    label: "a month, year one",
    ph: "P1: confirm stipend",
  },
  { figure: TERMS.agreement, label: "agreement", ph: "P1: confirm agreement term" },
  { figure: "Full time", label: "on site, five days", ph: null },
] as const;

/* ==========================================================================
   ROLES — trainee, four of them.

   `tech` holds `{ name, file }` — the `Tech` shape from content/service.ts —
   because the technologies read as ICONS here rather than as another row of
   word chips (the user's request, 2026-09-08).

   REAL LOGO FILES, NOT DRAWINGS. The first pass hand-authored nine SVG marks
   in a `TechIcon.tsx`. That file is deleted: `public/tech/` already holds the
   published logos and `components/service/TechLogo.tsx` already renders them,
   so the drawings were a second, worse copy of something the project had. Two
   were not even the right mark (Postgres drawn as a cylinder, Docker as
   stacked boxes) and two more had to be redrawn after rendering badly at 20px.

   Every `file` must exist in `public/tech/`. An <img> with a 404 src draws
   nothing and the plate goes blank — invisible rather than obviously broken —
   so `.careers.mjs` asserts all sixteen actually load.

   No `pay` field any more. Compensation is identical across all four roles and
   lives in TERMS, so repeating it per card would be four places to correct
   instead of one.
   ========================================================================== */
export const ROLES = [
  {
    id: "trainee-react",
    title: "React Developer — Trainee",
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
    title: "Ruby on Rails Developer — Trainee",
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
    title: "Python Developer — Trainee",
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
    title: "Node.js Developer — Trainee",
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
   SENIOR_ROLES — PARKED, NOT DELETED. 2026-09-08.

   "For seniors the vacancy is not available for now, so keep it somewhere
   reusable." This is that place. Nothing imports it today; the careers page
   states in one line that senior hiring is closed, which is the honest version
   of the same fact and costs two sentences instead of six cards.

   To reopen: import SENIOR_ROLES in Roles.tsx and render it as a second group.
   The shape is intentionally UNCHANGED from the 2026-09-07 version — same
   fields, same copy — so nothing has to be rewritten to bring it back. The
   salary bands were never confirmed and were data-placeholder then; they still
   are, and must stay flagged if this is ever rendered.
   ========================================================================== */
export const SENIOR_ROLES = [
  {
    id: "senior-react-engineer",
    title: "Senior React Engineer",
    hue: "brand",
    disciplines: ["Frontend"],
    seniority: "6+ years",
    tech: [
      { name: "React.js", file: "reactjs.svg" },
      { name: "TypeScript", file: "typescript.svg" },
      { name: "Tailwind CSS", file: "tailwindcss.svg" },
      { name: "Git", file: "git.svg" },
    ],
    pay: "₹28–42L / year",
    summary:
      "Own the front end of a client product end to end — the component library, the data layer, the accessibility, and the Friday demo that shows it working.",
  },
  {
    id: "senior-rails-engineer",
    title: "Senior Ruby on Rails Engineer",
    hue: "accent",
    disciplines: ["Backend"],
    seniority: "6+ years",
    tech: [
      { name: "Ruby on Rails", file: "rails.svg" },
      { name: "PostgreSQL", file: "postgresql.svg" },
      { name: "Docker", file: "docker.svg" },
      { name: "Git", file: "git.svg" },
    ],
    pay: "₹28–42L / year",
    summary:
      "Take Rails applications that grew faster than their design and make them boring again — without a rewrite nobody funded.",
  },
  {
    id: "senior-python-engineer",
    title: "Senior Python Engineer",
    hue: "teal",
    disciplines: ["Backend", "Data & AI"],
    seniority: "6+ years",
    tech: [
      { name: "Python", file: "python.svg" },
      { name: "PostgreSQL", file: "postgresql.svg" },
      { name: "Docker", file: "docker.svg" },
      { name: "Git", file: "git.svg" },
    ],
    pay: "₹30–45L / year",
    summary:
      "Build the pipelines, and the model-backed features on top of them, with evaluation, cost ceilings and lineage — not a notebook that impressed once.",
  },
  {
    id: "senior-node-engineer",
    title: "Senior Node.js Engineer",
    hue: "indigo",
    disciplines: ["Backend", "Platform"],
    seniority: "6+ years",
    tech: [
      { name: "Node.js", file: "nodejs.svg" },
      { name: "TypeScript", file: "typescript.svg" },
      { name: "PostgreSQL", file: "postgresql.svg" },
      { name: "Git", file: "git.svg" },
    ],
    pay: "₹28–42L / year",
    summary:
      "Design the APIs everything else in the product leans on — and the unglamorous operational work that keeps them up at 3am without you.",
  },
] as const;

/* ==========================================================================
   PATH — how we hire. Three steps, down from four.

   The paid three-hour exercise from the senior version is gone: it does not
   make sense for somebody with no professional experience, and paying for a
   fresher's test would have been a claim we cannot verify either. What is left
   is what a fresher can actually be assessed on — a conversation and a small
   piece of real work, in the office, because the job is in the office.
   ========================================================================== */
export const PATH = [
  {
    k: "doc",
    n: "01",
    title: "Send anything that shows you code",
    when: "Reply in 3 days",
    body: "A CV, a GitHub link, a college project, a screenshot of something you built. No cover letter and no application portal. Everyone gets an answer, including a no.",
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

/* The counter-list. Shorter than the senior version and every line is
   something a fresher in this market is genuinely afraid of. */
export const PATH_NO = [
  "No training fee, ever — we pay you, not the other way round",
  "No certificate-course upsell",
  "No ghosting — everybody hears back",
] as const;

/* Two honest lists. On this page they carry more weight than they did on the
   senior version: somebody signing a two-year agreement at twenty-two should
   be told plainly what they are signing up for. */
/* Each entry carries its own Icon.tsx glyph. A repeated tick down the column
   said "list"; a glyph per line says WHAT the line is about, which is the
   whole reason DS §1.2 rule 5 allows hue on icon tiles at all — it is
   categorical, not decorative.

   The pairing is also what equalises the two columns. The YES list is five
   short lines and the NO list is four long ones; at one line of text per row
   that is a ~3-line height difference and the shorter card bottoms out. As
   icon ROWS the arithmetic changes to 5 × short ≈ 4 × tall, and the columns
   land within a few pixels of each other without a magic number anywhere. */
export const FIT_YES = [
  { k: "rocket", t: "You want to be taught properly, and you will do the hours it takes." },
  { k: "layers", t: "You can get to Gobichettipalayam every working day." },
  { k: "code", t: "You would rather learn one stack deeply than sample four." },
  { k: "users", t: "You take a code review as help rather than as criticism." },
  { k: "phone", t: "You ask early instead of being stuck quietly for two days." },
] as const;

/* The closing line under each list. BOTH of them, not just the warning's —
   they were asymmetric (only the right-hand list had one) and that asymmetry
   was half of why the left column bottomed out ~200px short of the right in
   the shared panel. Copy belongs here rather than inline in FitCheck.tsx
   anyway; the component had been holding these two strings since it was
   written, which is the thing CLAUDE.md §2 says not to do. */
/* The two column headings. "You will do well here if…" / "You will not, if…"
   were replaced 2026-09-08: the user could not read the pair at a glance, and
   they were right to flag it. Three things were wrong with them —

     · the second one is an ELLIPSIS OF THE FIRST. "You will not, if…" only
       parses if you have already read and held the sentence above it, and the
       two headings sit far apart on a wide screen.
     · "do well here" is idiomatic. These roles are advertised to freshers in
       Tamil Nadu, most of whom read English as a second language; an idiom is
       the first thing to go.
     · neither says what the reader is deciding. "This job is / is not for you"
       names the decision in the heading, which is the whole point of the
       section.

   Kept parallel and near-identical on purpose: the pair should differ by one
   word, so the contrast is the thing that registers rather than the wording. */
export const FIT_TITLES = {
  yes: "This job is for you if…",
  no: "This job is not for you if…",
} as const;

export const FIT_NOTES = {
  yes: "If three of these sound like you, that is enough to apply. Nobody arrives with all five.",
  no: "None of these are character flaws — they describe a different job, and there are good ones. Deciding here costs you five minutes. Deciding in month three costs you a year.",
} as const;

export const FIT_NO = [
  { k: "layers", t: "You need remote or hybrid. This role is on site, every day — there is no version of it that is not." },
  { k: "clock", t: "You cannot commit two years. The training only makes sense to us if you stay to use it." },
  { k: "receipt", t: "You want a market salary in year one. It is ₹10,000 a month, fixed, and we would rather you knew now." },
  { k: "user-check", t: "You are looking for a senior role. We are not hiring seniors at the moment." },
] as const;

/* ==========================================================================
   LIFE — the bento. Added 2026-09-08 on request.
   ==========================================================================
   The reference careers page (conversedatasolutions.com/careers) has a "Life
   at Converse" block: four photographs of the office in a bento, captioned
   "A collaborative, fast-paced, and incredibly rewarding environment."

   This site.ts banner previously listed that section as one of the two things
   deliberately NOT reproduced. The user asked for it directly, which is
   CLAUDE.md §8's case: flag once, then build and mark it. This is the build,
   and the note above has been amended rather than left contradicting it.

   ── `img: null`, THE SAME SWITCH THE /about ROSTER USES ──────────────────
   Every tile has an `img` field and every one is `null`. Until a real
   photograph exists the tile renders a DESIGNED fallback — a hue-washed panel
   with a glyph watermark and the caption — rather than an empty frame, which
   advertises the absence and looks broken.

   Drop a file into `public/life/` and set `img` to its filename: the tile
   switches to the photograph with the caption over a scrim, and nothing else
   changes. That is the whole reason it is shaped this way instead of waiting.

   NOT stock photography, under any circumstances. A stock office with people
   who do not work here is the same fabrication as an invented colleague, and
   on a page aimed at people who would be IN that room it is worse — they will
   see the real one on day one.

   ── THE COPY IS THE OTHER HALF OF THE POINT ──────────────────────────────
   "Collaborative, fast-paced and incredibly rewarding" is three adjectives
   nobody can check and every company claims. Each tile here says something
   specific and falsifiable instead — where people sit, what happens on a
   Friday, what the hours are — which is the same standard the rest of this
   page holds itself to.

   ⚠ ALL FOUR ARE UNVERIFIED. They describe an office none of this was written
   from. The grid carries data-placeholder for the set. Confirm or correct each
   one before publishing, and delete any that are not true rather than
   softening them into adjectives.
   ========================================================================== */
/* ==========================================================================
   GALLERY — the moments rail under "Life here" on /careers.
   ==========================================================================
   EVERY `img` IS null, AND THAT IS THE POINT. GalleryRail renders a quiet
   captioned frame when `img` is null and a photograph when it is a filename
   in `public/gallery/`. There is no `public/gallery/` directory yet, and
   until there are REAL photographs of THIS office, there must not be one:

     · CLAUDE.md §6 P1 is explicit that we do not launch with invented people.
     · site.ts's own careers banner records that the reference site's "Life
       at …" photo bento was deliberately NOT reproduced, because stock faces
       on a careers page are the exact failure the review calls "asking for
       trust while showing no proof".
     · A stock photograph of a generic office is worse here than an empty
       frame. The frame reads as a company that has not taken the photographs
       yet; the stock shot reads as one that is pretending.

   So the captions are written first and the pictures arrive later. Each one
   describes a thing that actually happens in the room, so a photographer has
   a brief rather than a mood board — and each is checkable, which is what
   keeps this section honest while it waits.

   TO SHIP A PHOTO: drop the file in `public/gallery/`, put its filename in
   `img`, and the rail switches that card to the image treatment on its own.
   Nothing else changes.

   ⚠ These captions describe the training floor as the careers page describes
   it elsewhere (on site, six months, seniors and trainees in one room). They
   inherit the same claim status as PROGRAMME and TERMS: if the real
   arrangement differs, these are wrong too. */
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
    body: "What is in progress, what is blocked, and who is waiting on whom — visible from the door rather than buried in a tool.",
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

export const LIFE = [
  {
    k: "users",
    hue: "brand",
    /* `span` is the bento arrangement, and the four values are load-bearing
       together — see LifeHere.tsx. Whole class strings, never composed. */
    span: "lg:col-span-2 lg:row-span-2",
    tag: "The room",
    title: "One floor, and everyone is on it",
    body: "Seniors sit with trainees. There is no separate area for either, which is mostly why the training works — you overhear the answer to a question you had not thought to ask yet.",
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
    body: "Not a metro, and that is the point — a short commute, and an office people actually come to.",
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
  /** Filename in `public/life/`, or null for the designed fallback. This one
   *  field is the switch between the honest state and the finished one. */
  img: string | null;
}[];

/* Candidate FAQ. Every question here is one that would otherwise be asked on
   a call, and three of them are the awkward ones. */
export const CAREER_FAQ = [
  {
    q: "Is there any remote or hybrid option?",
    a: "No. Every role on this page is on site in Gobichettipalayam, Tamil Nadu, five days a week. Training in particular does not work remotely — most of what you learn in the first six months comes from somebody turning their screen towards you.",
  },
  {
    q: "I am a fresher with no work experience. Can I apply?",
    a: "Yes — that is who these roles are for. Up to about a year of experience is fine too. What we look for is something you have actually built, however small, and the ability to talk about how you built it.",
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
    a: "Not at the moment. When senior hiring opens it will be posted on this page first — send us a note and we will tell you when it does rather than keep a role listed that does not exist.",
  },
] as const;
