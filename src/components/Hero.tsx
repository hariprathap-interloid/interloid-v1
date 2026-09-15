import HeroScatter from "./HeroScatter";

/* Home hero. A Server Component; only <HeroScatter /> is client code.
   The badge carries the audience and the lead carries the offer: combined,
   the badge wraps to two lines on phones. In the lead, "as a demo" is
   load-bearing; without it the copy claims weekly production releases. */
export default function Hero() {
  return (
    <section
      id="home"
      data-hero
      className="relative flex min-h-screen items-center overflow-hidden px-6 pt-24 lg:px-16"
    >
      <div className="hero-fallback" aria-hidden="true" />
      <HeroScatter />
      <div className="scrim" aria-hidden="true" />
      <div className="scrim-spread" data-scrim-spread aria-hidden="true" />
      <div className="relative z-10 mx-auto w-full max-w-[1600px]">
        {/* Narrower copy from 900 to 1439px buys the mark room: HeroScatter
            places the mark from where this column ends. It widens at 1440, not
            `xl:`, because the mark is already near its height cap there and
            the switch barely moves it. */}
        <div className="max-w-3xl min-[900px]:max-w-136 min-[1440px]:max-w-3xl 2xl:max-w-3xl">
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

          {/* The hero H1 is the only place font-black (900) is used. */}
          <h1
            data-reveal
            style={{ "--delay": "100ms" } as React.CSSProperties}
            className="mb-7 font-hero text-[2.6rem] font-black leading-[1.04] tracking-tight text-foreground sm:text-5xl md:text-[3.5rem] lg:text-6xl 2xl:text-7xl"
          >
            The problem isn&rsquo;t ideas.
            <br />
            <span className="t-accent">It&rsquo;s shipping.</span>
          </h1>

          {/* Deck in Inter, not the display face: Satoshi ships only 900, so
              font-semibold would not render as intended. */}
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
            addressed as they arise, not discovered at the end of a
            sprint or review cycle.
          </p>

          <div
            data-reveal
            style={{ "--delay": "300ms" } as React.CSSProperties}
            className="flex flex-wrap items-center gap-4"
          >
            <a
              href="/contact#story"
              className="shine group relative inline-flex h-12 items-center gap-2 overflow-hidden whitespace-nowrap rounded-full bg-primary px-6 text-[15px] font-medium text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:bg-brand-light hover:shadow-2xl hover:shadow-primary/40 active:scale-95 sm:h-14 sm:px-9 sm:text-lg"
            >
              <span className="sm:hidden">Book a free consult</span>
              <span className="hidden sm:inline">Book a free 30-min consult</span>
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
            <a
              href="#work"
              className="inline-flex h-12 items-center whitespace-nowrap rounded-full border border-border bg-card/60 px-6 text-[15px] font-medium sm:h-14 sm:px-8 sm:text-lg text-foreground backdrop-blur-sm transition-all hover:border-primary hover:bg-card hover:text-primary active:scale-95"
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

      {/* z-[2]: above the scrim (1), below the copy (10). At the copy's level
          it would paint over the CTAs on short viewports. */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[2] h-32 bg-gradient-to-t from-[var(--hero-bg)] to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}
