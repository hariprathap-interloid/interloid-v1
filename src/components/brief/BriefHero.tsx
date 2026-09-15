import Icon from "@/components/Icon";
import { BRIEF_DIRECT, BRIEF_FACTS, BRIEF_HERO } from "@/content/brief";

/* The top of /contact: the promise, a direct-contact line for anyone who would
   rather not fill anything in, then the three facts that make the letter feel
   safe (how long, who reads it, what happens next). */
export default function BriefHero() {
  const r = (delay?: string) => ({
    "data-reveal": "",
    style: { "--delay": delay } as React.CSSProperties,
  });

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
            {/* nowrap: keeps the country code on the same line as the number. */}
            <a
              href={`tel:${BRIEF_DIRECT.tel}`}
              className="whitespace-nowrap font-medium text-primary hover:text-brand-light"
            >
              {BRIEF_DIRECT.phone}
            </a>
          </p>
        </div>

        {/* One panel, three cells: a shared object absorbs uneven copy
            lengths where three separate cards would bottom out ragged. */}
        <ul
          {...r("300ms")}
          className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-3"
        >
          {BRIEF_FACTS.map((f) => (
            <li key={f.label} className="flex gap-4 bg-card p-6">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/15">
                <Icon name={f.k} className="size-5" />
              </span>
              <span className="min-w-0">
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
