import Icon from "../Icon";
import { ABOUT_FACTS, ABOUT_HERO } from "@/content/about";

/* /about hero.

   Same skeleton as WhyHero and CareersHero — `min-h-svh`, bg-secondary,
   badge → H1 → lead → one action — so the four sub-pages read as one site.

   ── THE BACKDROP IS THE DIFFERENCE ───────────────────────────────────────
   Each sub-page hero has its own texture, and by now they are a set:
   /careers is a DOT grid, /why-choose-us is a LINE grid ("this page is a
   document"). This one has NO grid at all — two orbs and nothing else. It is
   the quietest hero on the site on purpose: the page is a company talking
   about itself, and a ruled backdrop would give it a formality the copy
   spends three paragraphs disowning.

   `min-h-[88svh]` with `items-center`, not padding-sized: a padding-sized hero
   is a FIXED height at every viewport, which measured 57% of a 2560×1440
   monitor on /careers before that was fixed.

   Three details, all of them learned on the careers hero:
     · `svh`, not `vh`. `vh` is the LARGEST viewport height on mobile, so a
       `100vh`-family hero sits under the browser's own chrome until scrolled.
     · a MINIMUM, so it can never squash content on a short viewport.
     · 88 rather than 100, so the next section's top edge stays visible. A hero
       that exactly fills the screen hides the fact that anything is below it.

   ⚠ /why-choose-us' hero uses a full `min-h-svh`, so the site currently has
   two rules for the same thing. Flagged to the user rather than unified here:
   that hero's height was set on their instruction on 2026-09-08 and is not
   this page's to change. */
export default function AboutHero() {
  return (
    <section
      id="about-top"
      className="relative flex min-h-[88svh] items-center overflow-hidden bg-secondary pb-24 pt-32"
    >
      <div
        className="pointer-events-none absolute -top-32 right-0 size-[620px] translate-x-1/4 rounded-full bg-brand/15 blur-[130px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 size-[460px] -translate-x-1/3 translate-y-1/3 rounded-full bg-accent/15 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative z-10 shell">
        <div className="max-w-3xl 2xl:max-w-4xl">
          <div
            data-reveal
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium leading-[1.5] shadow-sm"
          >
            <span className="text-accent-strong">
              <Icon name="quote" className="size-4" />
            </span>
            <span className="text-muted-foreground">{ABOUT_HERO.eyebrow}</span>
          </div>

          {/* Two BLOCK spans, and the gradient is applied to ONE of them
              whole. HANDOFF §5.13: `background-clip: text` paints on the
              parent, so an inline-block child falls outside the clip and
              renders as nothing. Never split a gradient across spans. */}
          <h1
            data-reveal
            style={{ "--delay": "100ms" } as React.CSSProperties}
            className="font-display text-4xl font-medium leading-[1.1] tracking-[-0.025em] text-foreground md:text-5xl lg:text-[3.5rem] 2xl:text-[4rem]"
          >
            <span className="block">{ABOUT_HERO.head}</span>
            <span className="block bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
              {ABOUT_HERO.accent}
            </span>
          </h1>

          <p
            data-reveal
            style={{ "--delay": "200ms" } as React.CSSProperties}
            className="mt-6 max-w-2xl text-lg leading-[1.5] text-muted-foreground 2xl:max-w-3xl 2xl:text-xl"
          >
            {ABOUT_HERO.lead}
          </p>

          <div
            data-reveal
            style={{ "--delay": "300ms" } as React.CSSProperties}
            className="mt-10"
          >
            <a
              href={ABOUT_HERO.href}
              className="inline-flex h-14 items-center gap-2 rounded-full bg-primary px-8 text-[17px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-[background-color,box-shadow] duration-300 hover:bg-brand-light hover:shadow-primary/40 active:scale-95"
            >
              {ABOUT_HERO.cta}
              <Icon name="arrow" className="size-5" />
            </a>
          </div>
        </div>

        {/* One panel of four cells rather than four cards. Careers learned
            this the hard way: as separate cards, a cell whose body wraps to
            two lines leaves the row visibly ragged, and `h-full` only moves
            the gap inside the boxes. FLEX, not grid — `divide-x` keys off DOM
            order, so on a wrapping grid it draws a rule down the left of a
            cell that is sitting in column one. */}
        <div
          data-reveal
          style={{ "--delay": "380ms" } as React.CSSProperties}
          className="mt-14"
        >
          <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-[1.5rem] border border-border bg-card/80 shadow-sm backdrop-blur-sm md:flex-row md:divide-x md:divide-y-0">
            {ABOUT_FACTS.map((f) => (
              <li
                key={f.label}
                className="flex flex-1 items-start gap-3 p-6"
                {...(f.ph ? { "data-placeholder": f.ph } : {})}
              >
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/15">
                  <Icon name={f.k} className="size-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[15px] font-bold leading-[1.4] tracking-[-0.015em] text-foreground">
                    {f.label}
                  </span>
                  <span className="mt-1 block text-[13px] leading-[1.6] text-muted-foreground">
                    {f.body}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
