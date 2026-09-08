import HeroStage from "./HeroStage";

/* ==========================================================================
   HERO — treatment C "Terms" layout, contrast headline.

   A Server Component: nothing here is interactive, so none of this markup
   ships as JavaScript. Only <HeroStage /> crosses the client boundary, and
   even that code-splits `three` out of the initial bundle (see HeroStage).

   Layout is treatment C from hero-copy-lab.html — left copy over the mark,
   proof as an editorial rail rather than a chip row — with treatment A's
   contrast headline, which carries more.

   The badge carries the AUDIENCE, the lead carries the OFFER. Keep it split:
   the full "Senior product engineering · for founders and business leaders"
   string wrapped to a two-line pill at 390px (the dot then floats mid-left and
   reads as broken) and duplicated "senior engineering team" in the lead
   directly beneath (HANDOFF §5.27).

   Word order in the lead is a positioning decision, not a copy tweak: "senior
   engineering expertise with modern AI" — never AI-first. The site is sold on
   seniority end to end, and an AI-led hero reads cheap and automated, which is
   the exact fear the rest of the page answers (§5.26).

   "as a demo" is load-bearing. "Delivering working software every week" on its
   own claims weekly PRODUCTION releases, which is not on HANDOFF §7's allowed
   list; "weekly working demo" is.

   OPEN: the mobile CTA sits ~162px below an 844px fold. HANDOFF §6 item 11 —
   accept it, halve the mark on mobile, or show two sentences below `sm:`.
   ========================================================================== */
export default function Hero() {
  return (
    <section
      id="home"
      data-hero
      className="relative flex min-h-screen items-center overflow-hidden px-6 pt-24 lg:px-16"
    >
      <div className="hero-fallback" aria-hidden="true" />
      <HeroStage />
      <div className="scrim" aria-hidden="true" />
      <div className="scrim-spread" data-scrim-spread aria-hidden="true" />
      <div className="relative z-10 mx-auto w-full max-w-[1600px]">
        <div className="max-w-3xl 2xl:max-w-[48rem]">
          <div
            data-reveal
            className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-border bg-card px-4 py-2 shadow-sm"
          >
            <span
              className="size-2 rounded-full bg-accent"
              aria-hidden="true"
            />
            <span className="text-sm font-medium text-muted-foreground">
              For founders &amp; business leaders
            </span>
          </div>

          {/* DS §3.2: the hero H1 is the only place font-black (900) is used.
              Solid, not gradient — chosen in hero-type-lab.html. */}
          <h1
            data-reveal
            style={{ "--delay": "100ms" } as React.CSSProperties}
            className="mb-7 font-hero text-[2.6rem] font-black leading-[1.04] tracking-tight text-foreground sm:text-5xl md:text-[3.5rem] lg:text-6xl 2xl:text-7xl"
          >
            The problem isn&rsquo;t ideas.
            <br />
            <span className="t-accent">It&rsquo;s shipping.</span>
          </h1>

          {/* DECK + BODY, not one paragraph. At 60 words a single block is a
              wall; the deck gives the eye an entry point and keeps DS §3.2's
              "lead is text-xl" satisfied, with detail one step down.

              The deck is Inter, not the display face: Satoshi has no 600, so
              font-semibold there resolves to 700 and fights the 900 H1. */}
          <p
            data-reveal
            style={{ "--delay": "200ms" } as React.CSSProperties}
            className="mb-5 max-w-2xl text-xl font-semibold text-foreground sm:text-2xl"
          >
            Defined problems in. Deployed software out.
          </p>

          <p
            data-reveal
            style={{ "--delay": "260ms" } as React.CSSProperties}
            className="mb-10 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Interloid combines senior engineering expertise with modern AI and
            agentic workflows to accelerate every stage of development. We
            build, test, and ship continuously, delivering working software
            every week as a demo and maintaining clarity throughout the process.
            Bugs, product changes, and potential issues are surfaced and
            addressed as they arise &mdash; not discovered at the end of a
            sprint or review cycle.
          </p>

          <div
            data-reveal
            style={{ "--delay": "300ms" } as React.CSSProperties}
            className="flex flex-wrap items-center gap-4"
          >
            <a
              href="#contact"
              className="shine group relative inline-flex h-14 items-center gap-2 overflow-hidden rounded-full bg-primary px-9 text-lg font-medium text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:bg-brand-light hover:shadow-2xl hover:shadow-primary/40 active:scale-95"
            >
              Book a free 30-min consult
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
            {/* "See the proof" points at §06 Selected Work, which is three
                placeholder cards — HANDOFF §7's case-study P0 is therefore a
                hero-level promise. Land the case studies or repoint this. */}
            <a
              href="#work"
              className="inline-flex h-14 items-center rounded-full border border-border bg-card/60 px-8 text-lg font-medium text-foreground backdrop-blur-sm transition-all hover:border-primary hover:bg-card hover:text-primary active:scale-95"
            >
              See the proof
            </a>
          </div>
        </div>
      </div>

      <a
        href="#advantage"
        aria-label="Scroll to why Interloid"
        className="scroll-cue absolute bottom-8 left-1/2 z-20 hidden size-11 -translate-x-1/2 place-items-center rounded-full border border-border bg-card/70 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-primary hover:text-primary min-[900px]:grid"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </a>

      {/* z-[2], above the scrim (1) and below the copy (10). At z-10 it sat at
          the SAME level as the content and later in the DOM, so it painted
          over the CTAs at any viewport short enough to bring them within 128px
          of the bottom — 1280×720 washed both buttons out (HANDOFF §5.29). */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[2] h-32 bg-gradient-to-t from-[var(--hero-bg)] to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}
