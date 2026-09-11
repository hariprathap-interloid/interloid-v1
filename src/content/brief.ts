/* ==========================================================================
   /contact — "Tell us your story". Added 2026-09-11.
   ==========================================================================
   Every word of the project-enquiry page lives here: the hero, the story
   the visitor writes, the letter it becomes, the send, and the thank-you.
   The components (brief/*) hold no copy of their own — BRIEF_UI carries the
   small interface labels they used to hard-code.

   ── THE VOICE (rewritten 2026-09-11, at the user's request) ─────────────
   "More informative, attractive, easy to read and client friendly" — e.g.
   "We value your time" instead of "How much time do you have?". So:
     · short sentences, plain words, no jargon
     · talk TO the client ("you", "your idea"), and let them talk in the
       first person on their buttons ("Send my story")
     · every line either reassures or says what happens next
   A good part of the audience reads English as a second language; idioms
   are avoided on purpose.

   ── TWO VERSIONS, ONE SET OF ANSWERS ─────────────────────────────────────
     quick   three blanks: who, what you need, how to reach you
     full    four short chapters, about nine blanks
   Both use the SAME field names, so switching keeps everything already
   typed. The action reads `version` to know which letter's fields to accept.

   ── NOTHING IS A FORCED CHOICE ───────────────────────────────────────────
   Every blank is typed; `suggestions` only offer a one-tap way to fill it.

   ── REQUIRED ─────────────────────────────────────────────────────────────
   Only three things, in either version: a name, what they need, and ONE way
   to reach them (email OR phone — see BRIEF_REACH).

   ── CLAIMS ───────────────────────────────────────────────────────────────
   Everything promised here is on site.ts's allowed list: the free 30-minute
   consult, the written scope and price within 48 hours, a fixed price or
   transparent hourly rate, and "no account manager" (about.ts, unflagged).
   The $25k–$90k suggestion is the verified FAQ range. Deliberately NOT said,
   because they are unconfirmed: a reply time, "no sales team" (about.ts P1)
   and "we only use your details to reply" (there is no privacy policy yet —
   Footer P0).
   ========================================================================== */

type Base = {
  /** The FormData key, shared by both versions. Also the draft key. */
  name: string;
  /** How the field is named in a sentence — "your name". Used for the
      accessible label, the empty slot in the letter, and "we still need…". */
  label: string;
  required?: boolean;
};

/** A blank inside the sentence. `suggestions` appear under the sentence as
    one-tap fills; the visitor can always type something else instead. */
export type Blank = Base & {
  kind: "blank";
  hint: string;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  suggestions?: readonly string[];
};
/** A longer answer, drawn as an open space under its sentence. */
export type Long = Base & { kind: "long"; hint: string };

export type Field = Blank | Long;
export type Segment = string | Field;

export type BriefChapter = {
  key: string;
  n: string;
  title: string;
  /** The line under the title that says why we ask. */
  voice: string;
  lines: readonly (readonly Segment[])[];
};

export type BriefVersion = {
  key: "quick" | "full";
  label: string;
  time: string;
  chapters: readonly BriefChapter[];
};

const blank = (
  name: string,
  label: string,
  hint: string,
  opts: Partial<Pick<Blank, "required" | "type" | "autoComplete" | "suggestions">> = {},
): Blank => ({ kind: "blank", name, label, hint, ...opts });

/* Shared by both letters, so the same answer carries across a switch. */
const NAME = blank("name", "your name", "your name", { required: true, autoComplete: "name" });
const COMPANY = blank("company", "your company", "your company", { autoComplete: "organization" });
const EMAIL = blank("email", "your email", "you@company.com", { type: "email", autoComplete: "email" });
const PHONE = blank("phone", "your phone number", "or a phone number", { type: "tel", autoComplete: "tel" });

const HELLO: readonly Segment[] = ["Hi Interloid, I’m ", NAME, " from ", COMPANY, "."];
const REACH: readonly Segment[] = ["You can reach me at ", EMAIL, " ", PHONE, "."];

/** At least one of these must be filled, in either version. */
export const BRIEF_REACH = {
  fields: ["email", "phone"],
  label: "an email or phone number to reach you",
} as const;

/* ── HERO ──────────────────────────────────────────────────────────────── */
export const BRIEF_HERO = {
  eyebrow: "Start your project",
  head: "Skip the form.",
  accent: "Tell us your story.",
  lead: "Write to us the way you’d explain it to a friend. Short on time? Three quick blanks are enough. Have a few minutes? Tell us the whole story — and watch it become a letter as you type.",
} as const;

/* The way round the letter, beside it. Same address and number as the
   footer and /about — connect@, not the hello@ some mailto links used. */
export const BRIEF_DIRECT = {
  title: "Prefer to talk?",
  body: "Email or call — you’ll reach the same engineers either way.",
  email: "connect@interloid.com",
  phone: "+91 9042032424",
  tel: "+919042032424",
  hours: "Based in India · our hours overlap with the US & UK",
} as const;

export const BRIEF_FACTS = [
  {
    k: "clock",
    label: "Quick or detailed — your choice",
    body: "30 seconds for the essentials, or about 3 minutes for the full picture.",
  },
  {
    k: "user-check",
    label: "Read by a real engineer",
    body: "The person who would build it reads every word — no account manager in between.",
  },
  {
    k: "receipt",
    label: "A clear next step",
    body: "A free 30-minute call, then a written scope and price within 48 hours.",
  },
] as const;

/* ── THE TWO LETTERS ───────────────────────────────────────────────────── */
export const BRIEF_VERSIONS: Record<"quick" | "full", BriefVersion> = {
  quick: {
    key: "quick",
    label: "Quick note",
    time: "30 sec",
    chapters: [
      {
        key: "quick",
        n: "",
        title: "Short on time? Just three blanks.",
        voice: "That’s all we need to get started. We’ll cover the rest together on a free 30-minute call.",
        lines: [
          HELLO,
          [
            "I’d love some help with ",
            blank("want", "what you need", "a new app, a rebuild, extra engineers…", { required: true }),
            ".",
          ],
          REACH,
        ],
      },
    ],
  },
  full: {
    key: "full",
    label: "Full story",
    time: "3 min",
    chapters: [
      {
        key: "you",
        n: "I",
        title: "About you",
        voice: "Just the basics, so we know who we’re talking to. You’ll hear back from a real, named engineer — never a ticket number.",
        lines: [HELLO],
      },
      {
        key: "need",
        n: "II",
        title: "Your idea",
        voice: "No technical words needed. Describe it the way you’d explain it to a friend — tap a suggestion or write your own.",
        lines: [
          [
            "We’re looking to ",
            blank("mode", "what you’re looking to do", "build, fix, or grow the team…", {
              suggestions: [
                "build something new",
                "fix or rebuild something we have",
                "add senior engineers to our team",
              ],
            }),
            ".",
          ],
          [
            "In a sentence or two,",
            {
              kind: "long",
              name: "want",
              label: "what you need",
              required: true,
              hint: "What would you like to build, who is it for, and what’s holding you back today?",
            },
          ],
        ],
      },
      {
        key: "now",
        n: "III",
        title: "Where you are today",
        voice: "Rough answers are perfectly fine. They simply help us come to the call prepared, so none of your time is wasted.",
        lines: [
          [
            "So far we have ",
            blank("stage", "where things stand", "an idea, a plan, a live product…", {
              suggestions: ["just an idea", "a design or plan", "an early version", "a live product"],
            }),
            ".",
          ],
          [
            "We’d like something ready ",
            blank("when", "when you need it", "within 3 months, this year…", {
              suggestions: ["within 3 months", "in 3–6 months", "later this year", "no fixed date"],
            }),
            ".",
          ],
          [
            "We’ve set aside roughly ",
            blank("budget", "your budget", "a rough number, or “not sure yet”", {
              suggestions: ["under $25k", "$25k–$90k", "more than $90k", "not sure yet"],
            }),
            ".",
          ],
        ],
      },
      {
        key: "reach",
        n: "IV",
        title: "Staying in touch",
        voice: "Leave whichever you check most — one is enough.",
        lines: [REACH],
      },
    ],
  },
};

/* ── SENDING ───────────────────────────────────────────────────────────── */
export const BRIEF_SEND = {
  question: "We value your time",
  questionHint: "Choose how much you’d like to share.",
  signoff: "Thanks —",
  cta: "Send my story",
  ctaQuick: "Send my note",
  pending: "Sending your story…",
  meta: ["Free, no obligation", "No sales pressure", "Price in writing within 48 hours"],
  failed: "Sorry — something went wrong on our side and your story didn’t send. Your words are safe in this browser, so please try again, or email us at connect@interloid.com.",
} as const;

export const BRIEF_DONE = {
  eyebrow: "Story received",
  head: "Thank you,",
  /** When no first name came through (the honeypot path). */
  headNoName: "Thank you!",
  lead: "Your story is safely with us. Here’s exactly what happens next.",
  steps: [
    {
      k: "user-check",
      title: "A real engineer reads it",
      body: "The person who would build your project reads every word — no account manager in between.",
    },
    {
      k: "phone",
      title: "We reach out to you",
      /** `{contact}` becomes the email or phone they gave. */
      body: "We’ll contact you at {contact} to set up a free 30-minute call. If we’re not the right fit, we’ll tell you honestly.",
    },
    {
      k: "receipt",
      title: "Your plan and price, in writing",
      body: "Within 48 hours of the call you’ll get a clear scope with a fixed price or a transparent hourly rate — easy to compare with anyone else.",
    },
  ],
  contactFallback: "the details you gave us",
  refLabel: "Your reference number",
  back: "Back to home",
} as const;

/* ── THE SMALL INTERFACE LABELS ────────────────────────────────────────
   Moved out of LetterComposer and parts.tsx 2026-09-11 with the rewrite —
   they are copy, and CLAUDE.md §2 keeps copy in src/content/. */
export const BRIEF_UI = {
  letterTo: "To the Interloid team",
  answered: (n: number, total: number) => `${n} of ${total} answered`,
  /** The phone bar that opens the letter (drawer design). */
  preview: "Preview your letter",
  previewAction: "View",
  sheetTitle: "Your letter so far",
  sheetClose: "Close",
  /** The tabs design (kept for the phase-2 review). */
  writeTab: "Write",
  letterTab: "Your letter",
  suggestionsOr: "or write your own",
} as const;

/* Every field in a letter, in reading order. */
export const fieldsOf = (chapters: readonly BriefChapter[]): Field[] =>
  chapters.flatMap((c) => c.lines.flat().filter((s): s is Field => typeof s !== "string"));

/* ── RULES SHARED BY THE LETTER AND THE ACTION ──────────────────────────
   One definition, so the "we still need…" line the visitor sees and the
   check the server applies can never disagree. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s().-]{6,}$/;
export const isEmail = (s = "") => EMAIL_RE.test(s.trim());
export const isPhone = (s = "") => PHONE_RE.test(s.trim());
/** At least one well-formed way to reach them. */
export const isReachable = (v: Record<string, string | undefined>) =>
  isEmail(v.email) || isPhone(v.phone);

/** "a", "a and b", "a, b and c". */
function list(items: string[]) {
  return items.length < 2
    ? items.join("")
    : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
export const missingMessage = (labels: string[]) =>
  `Almost there! We just need ${list(labels)}.`;

/** The finished letter as plain text, for whoever reads the submission.
    An empty optional blank is dropped together with the short connector
    that introduced it (" from ", " "), so the letter reads
    "Hi Interloid, I’m Asha." rather than "I’m Asha from …." */
export function tellStory(version: BriefVersion, values: Record<string, string>): string {
  return version.chapters
    .map((c) => {
      const lines = c.lines
        .filter((line) => line.some((s) => typeof s !== "string" && values[s.name]))
        .map((line) => lineText(line, values));
      return lines.length ? `${c.title}\n${lines.join("\n")}` : "";
    })
    .filter(Boolean)
    .join("\n\n");
}

/** One line of the letter as plain text — shared by tellStory and by any
    view that shows an answered line back. */
export function lineText(line: readonly Segment[], values: Record<string, string>): string {
  const out: string[] = [];
  line.forEach((s, i) => {
    if (typeof s === "string") return void out.push(s);
    const v = values[s.name]?.trim();
    if (v) return void out.push(s.kind === "long" ? ` ${v}` : v);
    const prev = line[i - 1];
    if (i > 1 && typeof prev === "string" && prev.trim().length <= 6) out.pop();
  });
  return out.join("").replace(/\s{2,}/g, " ").replace(/\s+([.,])/g, "$1").trim();
}
