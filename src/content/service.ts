/* ==========================================================================
   SERVICE PAGE CONTENT — added 2026-09-08, rebuilt on the LIVE SITE's content.
   ==========================================================================
   Copy for /services. Split out of site.ts because it is a page's worth of
   content with its own shape, and because the components in
   `src/components/service/` are written against these TYPES rather than
   against one page's data: a second service page later is a second object
   here plus a route, with no component changes.

   ── WHERE THE CONTENT CAME FROM ──────────────────────────────────────────
   interloid.com's own `#services` and `#technologies` sections, read with
   Playwright on 2026-09-08 at the user's instruction ("this is my old
   application… I expect this is going to be placed in the services page").
   Both are reproduced here in full:

     · SIX services, not the five the prototype carried. The live site splits
       what the prototype called "Product engineering" into Web, Mobile and
       Backend, and has no "Data & analytics" service at all. The live
       taxonomy wins — it is what the company actually sells.
     · Each service keeps its live promise paragraph and its three outcome
       bullets, in the live site's own words wherever those words are ours to
       keep (see the claim note below).
     · SIX technology stacks, grouped exactly as the live tabs group them.
       The live section renders emoji as its category icons; ours renders the
       real brand marks from `public/tech/` (CLAUDE.md §3.6 bans emoji as
       iconography, and the review names it the live site's most visible
       unpolish).

   ⚠ CLAIMS — READ BEFORE PUBLISHING. This is the important part.
   HANDOFF §7 allows exactly these as fact: free 30-min consult · 48-hr
   written proposal · weekly working demo · 30 days post-launch support ·
   30-day notice · 100% code/IP ownership · 8–12 weeks to a first version
   (14–20 larger) · engineers with 8–12 years each · no juniors substituted
   after signing · named in the proposal · work in the client's own accounts.

   The live bullets go far beyond that list — "save 40% on development
   costs", "99.99% uptime SLA", "Deploy 50+ times per day", "Reduce support
   tickets by 60%", "SOC 2, HIPAA-compliant", "Reduce operations overhead by
   40%". Every one of those is an unverified performance claim, so each
   carries a `ph` string and its component renders it `data-placeholder`.
   They are on the page because the user asked for this content; they are
   flagged because publishing a measured-sounding number nobody measured is
   the same fabricated-proof failure as a fake testimonial.

   TWO of them also CONTRADICT claims the site already makes, and those were
   reconciled rather than flagged, because publishing both numbers would make
   the site argue with itself:
     · live "Go live in 30-60 days" vs the verified "8–12 weeks to a focused
       first version" → the verified figure is used.
     · live "Senior engineers (10+ years exp.)" vs the verified "8–12 years
       each" → the verified figure is used.

   NO PRICE. The $25k–$90k range was removed from this page on request
   (2026-09-08). It is still published in home's FAQ, which is where the
   verified claim lives; do not reintroduce it here.
   ========================================================================== */

import type { Hue } from "./site";

/* The page's spine. A visitor is one of exactly two buyers and the whole
   page follows the one they pick — see components/service/ModeContext.tsx. */
export type ServiceMode = "build" | "extend";

/* One group of technologies inside a stack. `file` is a filename in
   `public/tech/`; omit it and TechLogo draws a monogram plate instead — we
   have no mark for FastAPI, LangChain, Pinecone and friends, and inventing
   one or borrowing a neighbouring product's (pandacss for pandas) would be
   worse than a lettered chip. */
export type Tech = { name: string; file?: string };
export type TechGroup = { group: string; items: readonly Tech[] };

export type Capability = {
  k: string;
  /** Icon name in Icon.tsx. */
  icon: string;
  /** The live site's service name. */
  name: string;
  hue: Hue;
  /** Diagram key in components/service/Diagrams.tsx. */
  figure: string;
  /** Imperative headline: neutral clause + ONE gradient clause (DS §1.2.4). */
  head: string;
  accent: string;
  /** The live promise paragraph. */
  body: string;
  /** The live outcome bullets. `ph` set = unverified, rendered flagged. */
  outcomes: readonly { text: string; ph?: string }[];
  /** The live #technologies tab for this service. */
  stack: readonly TechGroup[];
  /** One line under the stack — why this stack, in the live site's voice. */
  stackNote: string;
};

export type ModeDetail = {
  key: ServiceMode;
  icon: string;
  label: string;
  hint: string;
  heroAccent: string;
  heroLead: string;
  cta: string;
  title: string;
  who: string;
  terms: readonly string[];
  figure: string;
  caption: string;
};

/* ── HERO ──────────────────────────────────────────────────────────────── */
export const SERVICE_HERO = {
  eyebrow: "Comprehensive IT services",
  head: "Senior engineers who",
  lead: "Two ways to work with us, one standard of engineering. Tell us which you are and the rest of this page answers you.",
} as const;

/* ── MODES ─────────────────────────────────────────────────────────────────
   The two figures were the $25k–$90k range and "Monthly". The range came out
   on request; what replaced it is the verified timeline, which answers the
   same question a visitor is really asking at that point ("how long before
   this is real?") without publishing a number twice. */
export const SERVICE_MODES = [
  {
    key: "build",
    icon: "rocket",
    label: "Build it with us",
    hint: "An idea, a requirement or a stalled roadmap, and no team free to ship it",
    heroAccent: "build the thing you can't staff.",
    heroLead:
      "From custom web applications to mobile apps, cloud infrastructure and AI integration — we provide the complete technology services a growing business needs, built in your own accounts and yours from the first commit.",
    cta: "Start a project",
    title: "We build it. You own it, throughout.",
    who: "Best when the work is a defined slice — a first version, a rebuild, a platform your team has no capacity to start.",
    terms: [
      "A fixed price or a transparent hourly rate, in writing within 48 hours of the first call.",
      "A focused first version in 8–12 weeks; larger platforms run 14–20.",
      "A working demo every week from week one — software you can click, not a status report.",
      "Your GitHub organisation and your cloud accounts from the first commit. There is no handover ceremony because nothing of yours is ever in our hands.",
      "30 days of post-launch support included; a retainer after that is an option, never a dependency.",
    ],
    figure: "8–12 wks",
    caption: "to a focused first version",
  },
  {
    key: "extend",
    icon: "users",
    label: "Extend our team",
    hint: "A team and a roadmap already running, short on senior capacity",
    heroAccent: "join the team you already have.",
    heroLead:
      "Add experienced senior engineers without hiring costs, long-term overhead or months of onboarding. Ours join your repo, your board and your standups — named in the proposal, and out again with 30 days' notice.",
    cta: "Add engineers to our team",
    title: "Our seniors, inside your process.",
    who: "Best when the roadmap is yours, the context is yours, and what is missing is experienced hands who need no ramp-up.",
    terms: [
      "Engineers with 8–12 years each, named in the proposal before you commit.",
      "No juniors substituted after signing — the people you meet are the people you get.",
      "Your repo, your board, your review process and your rituals. Not a parallel track that reports in.",
      "Deliberate overlap with US and UK business hours: async by default, one scheduled live window every working day.",
      "30-day notice either way, so the moment you have hired, we step out cleanly.",
    ],
    figure: "30 days",
    caption: "notice, either way",
  },
] as const satisfies readonly ModeDetail[];

/* ── THE PROBLEM ───────────────────────────────────────────────────────────
   The client's own sentence first, our answer on disclosure. `to` names the
   capability the answer belongs to, so the link label is derived rather than
   hand-kept. */
export const SERVICE_PROBLEMS = [
  {
    q: "We keep planning features we never ship.",
    a: "Planning is not the bottleneck — the absence of a shipped slice is. We take one defined piece of the roadmap to production, then the next. You see a working demo every week, so momentum is visible instead of asserted.",
    to: "web",
  },
  {
    q: "Every release breaks something else.",
    a: "That is an architecture problem wearing a testing costume. We stabilise the foundations: boring architecture, tests that gate the deploy, and observability that pages a human before your customers notice.",
    to: "cloud",
  },
  {
    q: "Our backend can't take another year of growth.",
    a: "Rewrites are usually the expensive answer to a cheap question. We find the seams where the domain actually splits, make the hot paths boring and measurable, and scale what the traffic is really hitting — not what the architecture diagram suggests.",
    to: "backend",
  },
  {
    q: "Our AI demo impressed everyone and shipped to nobody.",
    a: "Demos die in review because nobody can prove they work. We build the other way round — start from the workflow, add retrieval and guardrails, and wrap it in an evaluation harness so “does it work?” has a measured answer and a cost per use.",
    to: "ai",
  },
  {
    q: "Hiring senior engineers is taking quarters, not weeks.",
    a: "Embed ours while you hire. Senior engineers join your standups, your repo and your review process, and leave with 30 days' notice the moment your own hire starts. No bench, and no juniors billed as seniors.",
    to: "team",
  },
] as const satisfies readonly { q: string; a: string; to: string }[];

/* ── CAPABILITIES ──────────────────────────────────────────────────────────
   The live site's six services, each with its live promise, its three live
   outcome bullets, and its live technology stack. `head`/`accent` is ours:
   the live H3s are category names ("Web Development"), which already appear
   as the label above, so the headline says what the client gets instead. */
export const CAPABILITIES: readonly Capability[] = [
  {
    k: "web",
    icon: "code",
    name: "Web Development",
    hue: "brand",
    figure: "slice",
    head: "Production-ready web apps,",
    accent: "without the six-month timeline.",
    body: "We build fast, scalable platforms that drive growth — without the bloated code or the six-month timeline. One thin slice goes all the way to real users first, because that is the only version of “on track” a stakeholder can verify.",
    outcomes: [
      {
        text: "A focused first version in 8–12 weeks, not quarters — with a working demo every week from week one.",
      },
      {
        text: "SEO-optimised from day one, and an architecture that scales to millions of users.",
        ph: "confirm the scale claim, or soften it",
      },
      { text: "You own 100% of the code — zero vendor lock-in." },
    ],
    stackNote:
      "The modern web stack that powers billion-dollar companies. React and Next.js deliver the user experience; TypeScript catches the bugs before production does.",
    stack: [
      {
        group: "Frontend frameworks",
        items: [
          { name: "React.js", file: "reactjs.svg" },
          { name: "Next.js", file: "nextjs.svg" },
          { name: "TypeScript", file: "typescript.svg" },
          { name: "JavaScript", file: "javascript.svg" },
          { name: "Vue.js", file: "vuejs.svg" },
          { name: "Angular", file: "angular.svg" },
        ],
      },
      {
        group: "Styling & UI",
        items: [
          { name: "Tailwind CSS", file: "tailwindcss.svg" },
          { name: "Sass / SCSS", file: "sass.svg" },
          { name: "Figma", file: "figma.svg" },
        ],
      },
      {
        group: "Build tools",
        items: [
          { name: "Vite", file: "vitejs.svg" },
          { name: "Webpack", file: "webpack.svg" },
        ],
      },
    ],
  },
  {
    k: "mobile",
    icon: "smartphone",
    name: "Mobile App Development",
    hue: "indigo",
    figure: "stores",
    head: "One codebase,",
    accent: "both app stores.",
    body: "Reach iOS and Android users from a single, maintainable codebase. One team, two platforms — so the development budget buys features rather than a second implementation of the same screens.",
    outcomes: [
      {
        text: "One team, two platforms — roughly 40% less development cost than two native builds.",
        ph: "confirm the 40% figure or remove it",
      },
      {
        text: "App-store ready in weeks, not quarters — including signing, review and the release train.",
        ph: "confirm a typical store-submission timeline",
      },
      {
        text: "Offline-first behaviour designed on purpose, so the app keeps working on a bad connection.",
      },
    ],
    stackNote:
      "Build once, deploy everywhere. React Native and Flutter ship to both stores at the same time — with native modules wherever the bridge is the wrong answer.",
    stack: [
      {
        group: "Cross-platform",
        items: [
          { name: "React Native", file: "reactjs.svg" },
          { name: "Flutter", file: "flutter.svg" },
          { name: "Expo" },
        ],
      },
      {
        group: "Native iOS",
        items: [{ name: "Swift", file: "swift.svg" }, { name: "Xcode" }],
      },
      {
        group: "Native Android",
        items: [
          { name: "Kotlin", file: "kotlin.svg" },
          { name: "Java", file: "java.svg" },
          { name: "Android Studio", file: "android.svg" },
        ],
      },
    ],
  },
  {
    k: "backend",
    icon: "server",
    name: "Backend Development & APIs",
    hue: "teal",
    figure: "api",
    head: "Infrastructure that grows",
    accent: "without the rewrite.",
    body: "Backends built to scale from day one — from launch to millions of requests a day — without the expensive rewrite in year two. Typed, versioned APIs your other vendors can build against, and data models that still make sense when the product changes.",
    outcomes: [
      {
        text: "Scales without rewriting the core systems as you grow.",
        ph: "confirm — evidence needed, or reword as an approach",
      },
      {
        text: "Audit-ready security practices, with the compliance work planned rather than retrofitted.",
        ph: "P0: the live site claims SOC 2 / HIPAA compliance — verify or remove",
      },
      {
        text: "Clean architecture your own team can maintain or extend after we leave.",
      },
    ],
    stackNote:
      "Backend technology chosen for scale. Node.js handles the concurrent connections, Python powers the data and ML paths, and Rails still gets an MVP to market fastest.",
    stack: [
      {
        group: "Node.js ecosystem",
        items: [
          { name: "Node.js", file: "nodejs.svg" },
          { name: "NestJS", file: "nestjs.svg" },
          { name: "Express.js", file: "expressjs-dark.svg" },
        ],
      },
      {
        group: "Ruby ecosystem",
        items: [
          { name: "Ruby", file: "ruby.svg" },
          { name: "Ruby on Rails", file: "rails.svg" },
        ],
      },
      {
        group: "Python ecosystem",
        items: [
          { name: "Python", file: "python.svg" },
          { name: "Django", file: "django.svg" },
          { name: "FastAPI" },
        ],
      },
      {
        group: "Databases",
        items: [
          { name: "PostgreSQL", file: "postgresql.svg" },
          { name: "MySQL", file: "mysql.svg" },
          { name: "MongoDB", file: "mongodb.svg" },
          { name: "Redis", file: "redis.svg" },
        ],
      },
    ],
  },
  {
    k: "cloud",
    icon: "cloud",
    name: "Cloud Infrastructure & DevOps",
    hue: "light",
    figure: "deploy",
    head: "A deploy your own team",
    accent: "can run without us.",
    body: "Provisioned as code in your own cloud accounts, reviewed like application code and planned in CI. The measure of the work is not that it runs — it is that your engineers can deploy, roll back and debug it on a Friday afternoon with us switched off.",
    outcomes: [
      {
        text: "Deploy on every push with zero downtime, and a rollback that is one documented command.",
        ph: "confirm the deploy-frequency claim (live site says 50+/day)",
      },
      {
        text: "Automated backups and a rehearsed recovery, with an uptime target agreed up front.",
        ph: "P0: the live site publishes a 99.99% uptime SLA — verify or remove",
      },
      {
        text: "Materially less operations overhead through automation, and runbooks a tired person can follow.",
        ph: "confirm the 40% overhead reduction or leave it qualitative",
      },
    ],
    stackNote:
      "Cloud infrastructure that scales automatically and costs less over time. Kubernetes expertise is what keeps peak traffic boring.",
    stack: [
      {
        group: "Cloud platforms",
        items: [
          { name: "AWS", file: "aws.svg" },
          { name: "Azure", file: "azure.svg" },
          { name: "Google Cloud", file: "google-cloud.svg" },
        ],
      },
      {
        group: "Containers & orchestration",
        items: [
          { name: "Docker", file: "docker.svg" },
          { name: "Kubernetes", file: "kubernetes.svg" },
        ],
      },
      {
        group: "CI/CD & automation",
        items: [
          { name: "GitHub Actions", file: "github-dark.svg" },
          { name: "Jenkins", file: "jenkins.svg" },
          { name: "GitLab CI", file: "gitlab.svg" },
          { name: "CircleCI", file: "circleci.svg" },
        ],
      },
      {
        group: "Monitoring & logging",
        items: [{ name: "Prometheus" }, { name: "Grafana", file: "grafana.svg" }],
      },
    ],
  },
  {
    k: "ai",
    icon: "sparkle",
    name: "AI Integration & Automation",
    hue: "accent",
    figure: "retrieval",
    head: "AI that survives",
    accent: "contact with review.",
    body: "Model-backed features wired into a real workflow, with retrieval over your own data, guardrails on both ends, and an evaluation harness that can tell a prompt change from a regression. We will also tell you when a problem does not need a model.",
    outcomes: [
      {
        text: "Repetitive work automated where the workflow is well understood — routing, triage, extraction.",
        ph: "confirm — the live site claims a 60% reduction in support tickets",
      },
      {
        text: "Documents processed in seconds rather than hours, with the failure cases designed for.",
        ph: "confirm the document-processing claim",
      },
      {
        text: "A cost ceiling per feature, modelled up front instead of discovered on an invoice.",
      },
    ],
    stackNote:
      "AI integrations that work in production, not just in a demo — with evaluation, guardrails and a cost model around every model call.",
    stack: [
      {
        group: "LLM frameworks",
        items: [
          { name: "OpenAI", file: "openai.svg" },
          { name: "LangChain" },
          { name: "LangGraph" },
        ],
      },
      {
        group: "ML frameworks",
        items: [
          { name: "TensorFlow", file: "tensorflow.svg" },
          { name: "PyTorch", file: "pytorch.svg" },
          { name: "Scikit-learn" },
        ],
      },
      {
        group: "Data science",
        items: [
          { name: "Python", file: "python.svg" },
          { name: "pandas" },
          { name: "NumPy", file: "numpy.svg" },
        ],
      },
      {
        group: "Vector databases",
        items: [{ name: "Pinecone" }, { name: "Weaviate" }],
      },
    ],
  },
  {
    k: "team",
    icon: "users",
    name: "Staff Augmentation",
    hue: "brand",
    figure: "merge",
    head: "Senior hands,",
    accent: "inside your process.",
    body: "Add experienced senior engineers without hiring costs, long-term overhead or months of onboarding. They work in your repository and your rituals rather than alongside them — named in the proposal, the same people throughout.",
    outcomes: [
      {
        text: "Engineers with 8–12 years each — no juniors substituted after signing.",
      },
      {
        text: "Scale the team up or down in weeks, with 30 days' notice either way.",
      },
      {
        text: "They integrate into your workflows immediately: your board, your branch strategy, your review process.",
      },
    ],
    stackNote:
      "Senior developers who have shipped real products at scale. No bootcamp grads and no junior engineers learning on your budget.",
    stack: [
      {
        group: "Core expertise",
        items: [
          { name: "JavaScript", file: "javascript.svg" },
          { name: "TypeScript", file: "typescript.svg" },
          { name: "Python", file: "python.svg" },
          { name: "Ruby", file: "ruby.svg" },
          { name: "React", file: "reactjs.svg" },
          { name: "Next.js", file: "nextjs.svg" },
        ],
      },
      {
        group: "Development tools",
        items: [
          { name: "Git", file: "git.svg" },
          { name: "GitHub", file: "github-dark.svg" },
          { name: "VS Code", file: "vscode.svg" },
        ],
      },
    ],
  },
];

/* The live #technologies section's own headline, kept because it is the best
   sentence on the live site and it is entirely ours to keep — it makes a
   claim about judgement rather than about a metric. */
export const STACK_HEADING = {
  eyebrow: "Proven technology stacks",
  head: "We don't chase trends —",
  accent: "we build on what works.",
  lead: "Every stack below is one we run in production today. Pick a service to see what it is actually built on, and why.",
} as const;

/* ── APPROACH ──────────────────────────────────────────────────────────────
   How we take a problem apart. Deliberately NOT the four engagement steps
   from home's Process section — that is the calendar, this is the method. */
export const SERVICE_PRINCIPLES = [
  {
    n: "01",
    icon: "search",
    title: "Start from the decision, not the technology",
    body: "The first call establishes what has to become true for this to have been worth doing. If the honest answer is a spreadsheet, a config change or a different vendor, you hear that instead of a proposal.",
    build: "You get scope shaped around that outcome — and a written no if it does not need us.",
    extend: "Your team keeps the roadmap; our engineers arrive already knowing what it is for.",
  },
  {
    n: "02",
    icon: "rocket",
    title: "One thin slice, all the way to production",
    body: "The first milestone crosses every layer the product will ever have — interface, service, data, deploy — rather than finishing one layer at a time. Integration risk arrives in week two, when it is cheap.",
    build: "Something real is in production long before the build is finished.",
    extend: "Our first pull request goes into your repo in the first week, not the first month.",
  },
  {
    n: "03",
    icon: "shield",
    title: "Boring architecture, tested at the seams",
    body: "We reach for Postgres before a new service and delete a component before adding one. Tests concentrate where systems actually break — the boundaries — so the suite stays worth running.",
    build: "A stack your team can staff for, not one only we can maintain.",
    extend: "Reviews that raise the floor of the codebase your team already owns.",
  },
  {
    n: "04",
    icon: "monitor-play",
    title: "The demo is the status report",
    body: "Every week you get software you can click and a short written note. A bad week shows up in that week's demo, with options attached — never in a month-end surprise.",
    build: "Weekly demos from week one, for the length of the engagement.",
    extend: "Our engineers present their own work in your ceremonies, in your words.",
  },
  {
    n: "05",
    icon: "key-round",
    title: "Handover is a deliverable, not an event",
    body: "Everything lives in your accounts from day one, so leaving costs you nothing at any point. Runbooks are written for a tired person at 3am, and the last week of an engagement is not the first time anyone reads them.",
    build: "100% code and IP ownership throughout, plus 30 days of post-launch support.",
    extend: "30-day notice either way, and no knowledge that walks out with us.",
  },
] as const satisfies readonly {
  n: string;
  icon: string;
  title: string;
  body: string;
  build: string;
  extend: string;
}[];

/* ── WHY INTERLOID ─────────────────────────────────────────────────────────
   Five figures, all on the allowed list. The price range that used to sit
   here was removed on request; the timeline replaced it. */
export const SERVICE_TERMS = [
  { figure: "100%", caption: "code and IP yours, from the first commit" },
  { figure: "48 hrs", caption: "from first call to a written scope and price" },
  { figure: "Weekly", caption: "working demo, for the whole engagement" },
  { figure: "8–12 yrs", caption: "experience per engineer, no juniors swapped in" },
  { figure: "30 days", caption: "notice either way — and post-launch support included" },
] as const satisfies readonly { figure: string; caption: string }[];

/* ── HOW TO START ──────────────────────────────────────────────────────── */
export const SERVICE_START = [
  "A free 30-minute call, no obligation",
  "A written scope and price in 48 hours",
  "An honest no if you don't need us",
] as const;
