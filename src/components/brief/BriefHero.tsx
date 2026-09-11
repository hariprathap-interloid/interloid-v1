import Icon from "@/components/Icon";
import { BRIEF_DIRECT, BRIEF_FACTS, BRIEF_HERO } from "@/content/brief";

/* ==========================================================================
   BriefHero — the top of /content: the promise, then the three facts that
   make filling it in feel safe (how long, who reads it, what happens next).
   ==========================================================================
   Restored 2026-09-11 from the first /content layout, at the user's request:
   a hero band on top, the letter below it. The side-by-side spread that
   replaced it moved the facts into a column beside the letter; with the
   letter now split into questions + live preview there is no column to
   spare, so the facts go back to a band.

   The "Rather just talk?" line is new here: somebody in a real hurry should
   not have to fill in even three blanks, and it now costs one line.

   `reveal` — ON for /content, OFF where this renders after load (the lab's
   switcher). Reveal.tsx observes every [data-reveal] ONCE, on mount; a copy
   that appears later is never observed and stays at opacity 0 for good. */
export default function BriefHero({ reveal = true }: { reveal?: boolean }) {
  const r = (delay?: string) =>
    reveal ? { "data-reveal": "", style: { "--delay": delay } as React.CSSProperties } : {};

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
              <Icon name="doc" className="size-4" />
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
            <a href={`tel:${BRIEF_DIRECT.tel}`} className="font-medium text-primary hover:text-brand-light">
              {BRIEF_DIRECT.phone}
            </a>
          </p>
        </div>

        {/* One panel, three cells — the careers hero's terms band, for the same
            reason: a shared object absorbs uneven copy lengths where three
            separate cards would bottom out ragged. */}
        <ul
          {...r("300ms")}
          className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-3"
        >
          {BRIEF_FACTS.map((f) => (
            <li key={f.label} className="flex gap-4 bg-card p-6">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/15">
                <Icon name={f.k} className="size-5" />
              </span>
              <span>
                <strong className="block font-display text-[17px] font-semibold text-foreground">{f.label}</strong>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{f.body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
