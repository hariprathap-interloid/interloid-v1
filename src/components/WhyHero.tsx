import Icon from "./Icon";
import { WHY_HERO } from "@/content/site";

/* /why-choose-us hero, on the same skeleton as the careers hero: bg-secondary,
   masked backdrop texture, orb, then badge → H1 → lead → body → kicker →
   actions with reveal delays in 100ms steps.

   The texture is a LINE grid — ruled paper, for a page that argues "this is a
   document". `var(--border)` rather than a literal keeps it visible in dark.

   The H1 is two block spans so the two sentences always break. The gradient
   is applied to one whole span, never split across children: background-clip
   paints on the parent, so inline-block children render as nothing.

   One filled button only. The secondary action is a plain link whose arrow
   points at the next section, so it does not compete as a second pill. */
export default function WhyHero() {
  /* min-h-svh + items-center so the hero fills tall screens instead of being
     padding-sized. svh, not vh, to account for mobile browser chrome. */
  return (
    <section className="relative flex min-h-svh items-center overflow-hidden bg-secondary pb-24 pt-32">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] [-webkit-mask-image:radial-gradient(ellipse_70%_60%_at_40%_35%,#000_10%,transparent_100%)] [mask-image:radial-gradient(ellipse_70%_60%_at_40%_35%,#000_10%,transparent_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-24 right-0 size-[560px] translate-x-1/4 rounded-full bg-brand/15 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative z-10 shell">
        <div className="max-w-3xl">
          <div
            data-reveal
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium leading-[1.5] shadow-sm"
          >
            {/* shield, not doc: a badge further down the page already uses
                doc, and repeated badge icons read as copy-paste. */}
            <span className="text-accent-strong">
              <Icon name="shield" className="size-4" />
            </span>
            <span className="text-muted-foreground">{WHY_HERO.eyebrow}</span>
          </div>

          <h1
            data-reveal
            style={{ "--delay": "100ms" } as React.CSSProperties}
            className="font-display text-4xl font-medium leading-[1.1] tracking-[-0.025em] text-foreground md:text-5xl lg:text-[3.5rem]"
          >
            <span className="block">{WHY_HERO.head}</span>
            <span className="block bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
              {WHY_HERO.accent}
            </span>
          </h1>

          <p
            data-reveal
            style={{ "--delay": "200ms" } as React.CSSProperties}
            className="mt-6 max-w-2xl text-lg leading-[1.5] text-muted-foreground"
          >
            {WHY_HERO.lead}
          </p>

          <p
            data-reveal
            style={{ "--delay": "300ms" } as React.CSSProperties}
            className="mt-5 max-w-2xl text-lg leading-[1.5] text-muted-foreground"
          >
            {WHY_HERO.body}
          </p>

          {/* The bold close. It is set apart with an accent rule rather than
              another paragraph because it is the hero's thesis, and the copy
              itself is emphasised.

              Copy marked data-placeholder is unverified; confirm before
              public launch. */}
          <p
            data-reveal
            data-placeholder="P1: verify the engagement agreement actually carries these commitments"
            style={{ "--delay": "400ms" } as React.CSSProperties}
            className="mt-8 max-w-2xl border-l-2 border-accent pl-5 font-display text-lg font-bold leading-[1.45] tracking-[-0.015em] text-foreground"
          >
            {WHY_HERO.kicker}
          </p>

          <div
            data-reveal
            style={{ "--delay": "500ms" } as React.CSSProperties}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a
              href={WHY_HERO.ctaHref}
              className="group inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-brand-light hover:shadow-primary/40 active:scale-95 sm:h-14 sm:px-8 sm:text-[17px]"
            >
              <span className="sm:hidden">{WHY_HERO.ctaShort}</span>
              <span className="hidden sm:inline">{WHY_HERO.cta}</span>
              <span className="transition-transform group-hover:translate-x-1">
                <Icon name="arrow" className="size-5" />
              </span>
            </a>
            <a
              href={WHY_HERO.subHref}
              className="group inline-flex h-12 items-center gap-2 whitespace-nowrap px-2 text-[15px] font-semibold sm:h-14 sm:text-[17px] text-foreground transition-colors hover:text-accent-strong"
            >
              {WHY_HERO.sub}
              <span className="transition-transform group-hover:translate-y-1">
                <Icon name="arrow-down" className="size-5" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
