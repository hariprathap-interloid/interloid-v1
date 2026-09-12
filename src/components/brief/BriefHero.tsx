import Icon from "@/components/Icon";
import { BRIEF_DIRECT, BRIEF_FACTS, BRIEF_HERO } from "@/content/brief";

/* ==========================================================================
   BriefHero — the top of /contact: the promise, then the three facts that
   make filling it in feel safe (how long, who reads it, what happens next).
   ==========================================================================
   Restored 2026-09-11 from the first /contact layout, at the user's request:
   a hero band on top, the letter below it. The side-by-side spread that
   replaced it moved the facts into a column beside the letter; with the
   letter now split into questions + live preview there is no column to
   spare, so the facts go back to a band.

   The "Rather just talk?" line is new here: somebody in a real hurry should
   not have to fill in even three blanks, and it now costs one line.

   `reveal` — ON for /contact, OFF where this renders after load (the lab's
   switcher). Reveal.tsx observes every [data-reveal] ONCE, on mount; a copy
   that appears later is never observed and stays at opacity 0 for good.

   `facts` — how the three facts sit on a PHONE (from `sm` up, every mode is
   the same three-cell band). Samples added 2026-09-11 because on a 390px
   phone the three stacked cards pushed the first blank ~1,100px down:
     band    the three cards, stacked (live on /contact)
     list    sample A: one short line per fact, the full wording from sm up
     scroll  sample B: the full cards in one row you swipe sideways
   Compared in /contact-lab (Phone hero). */

export type FactsMode = "band" | "list" | "scroll";

/* Whole strings per mode — Tailwind only sees classes written out in full. */
const FACTS: Record<FactsMode, { ul: string; li: string; badge: string; icon: string }> = {
  band: {
    ul: "mt-12 grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-3",
    li: "flex gap-4 bg-card p-6",
    badge: "grid size-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/15",
    icon: "size-5",
  },
  list: {
    ul: "mt-8 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:mt-12 sm:grid-cols-3 sm:rounded-3xl",
    li: "flex items-center gap-3 bg-card px-4 py-3 sm:items-start sm:gap-4 sm:p-6",
    badge:
      "grid size-8 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand ring-1 ring-brand/15 sm:size-10 sm:rounded-xl",
    icon: "size-4 sm:size-5",
  },
  scroll: {
    ul: "mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] sm:mt-12 sm:grid sm:grid-cols-3 sm:gap-px sm:overflow-hidden sm:rounded-3xl sm:border sm:border-border sm:bg-border sm:pb-0",
    li: "flex w-[80%] shrink-0 snap-start gap-4 rounded-2xl border border-border bg-card p-5 sm:w-auto sm:rounded-none sm:border-0 sm:p-6",
    badge: "grid size-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/15",
    icon: "size-5",
  },
};

export default function BriefHero({
  reveal = true,
  facts = "band",
}: {
  reveal?: boolean;
  facts?: FactsMode;
}) {
  const r = (delay?: string) =>
    reveal ? { "data-reveal": "", style: { "--delay": delay } as React.CSSProperties } : {};
  const F = FACTS[facts];

  return (
    <section className="relative overflow-clip border-b border-border bg-secondary pb-16 pt-32 lg:pb-20 lg:pt-40">
      <div
        className="pointer-events-none absolute right-0 top-0 size-[520px] translate-x-1/3 -translate-y-1/4 rounded-full bg-accent/15 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 size-[420px] -translate-x-1/3 translate-y-1/3 rounded-full bg-brand/15 blur-[120px]"
        aria-hidden="true"
      />
      <div className="relative z-10 shell">
        <div className="max-w-3xl">
          <div
            {...r()}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium leading-[1.5] shadow-sm"
          >
            <span className="text-accent-strong">
              <Icon name="rocket" className="size-4" />
            </span>
            <span className="text-muted-foreground">{BRIEF_HERO.eyebrow}</span>
          </div>
          <h1
            {...r("100ms")}
            className="font-display text-4xl font-medium leading-[1.1] tracking-[-0.025em] text-foreground md:text-5xl lg:text-[3.5rem] 2xl:text-[4rem]"
          >
            {BRIEF_HERO.head}
            <br />
            <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
              {BRIEF_HERO.accent}
            </span>
          </h1>
          <p {...r("200ms")} className="mt-6 max-w-2xl text-lg leading-[1.6] text-muted-foreground">
            {BRIEF_HERO.lead}
          </p>
          <p {...r("260ms")} className="mt-4 text-sm text-muted-foreground">
            {BRIEF_DIRECT.title}{" "}
            <a href={`mailto:${BRIEF_DIRECT.email}`} className="font-medium text-primary hover:text-brand-light">
              {BRIEF_DIRECT.email}
            </a>{" "}
            ·{" "}
            {/* nowrap: on a phone "+91" was left at a line's end, the number
                on the next. */}
            <a
              href={`tel:${BRIEF_DIRECT.tel}`}
              className="whitespace-nowrap font-medium text-primary hover:text-brand-light"
            >
              {BRIEF_DIRECT.phone}
            </a>
          </p>
        </div>

        {/* One panel, three cells — the careers hero's terms band, for the same
            reason: a shared object absorbs uneven copy lengths where three
            separate cards would bottom out ragged. */}
        <ul {...r("300ms")} className={F.ul}>
          {BRIEF_FACTS.map((f) => (
            <li key={f.label} className={F.li}>
              <span className={F.badge}>
                <Icon name={f.k} className={F.icon} />
              </span>
              <span className="min-w-0">
                {facts === "list" && (
                  <span className="block font-display text-[15px] font-semibold text-foreground sm:hidden">
                    {f.short}
                  </span>
                )}
                <span className={facts === "list" ? "hidden sm:block" : "block"}>
                  <strong className="block font-display text-[17px] font-semibold text-foreground">{f.label}</strong>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{f.body}</span>
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
