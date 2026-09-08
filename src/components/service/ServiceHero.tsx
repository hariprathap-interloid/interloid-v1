"use client";

import Icon from "../Icon";
import { ModeSwitch, useServiceMode } from "./ModeContext";
import { SERVICE_HERO } from "@/content/service";

/* /services hero.

   The right-hand column is NOT an illustration. It is the qualifying
   question — "which of these two are you?" — because that is the single most
   useful thing this page can establish in the first screen, and because the
   answer changes the four sections below it (SERVICE-PAGE-RESEARCH.md §4).
   The reference pages put a product diagram here and speak to one buyer;
   putting the choice here is the clearest way this page is not that one.

   The copy column is the tabpanel the switch controls: the headline's
   gradient clause, the lead and the CTA label all come from the chosen mode,
   so a visitor sees the page answer them within one click. No aria-live is
   needed on top of that — tablist/tabpanel already tells assistive tech that
   pressing a tab replaces this region.

   Every [data-reveal] element keeps a STATIC className and only its text
   children change (ModeContext's banner explains why that rule exists). */
export default function ServiceHero() {
  const { detail } = useServiceMode();
  const activeTab = detail.key === "build" ? "mode-tab-0" : "mode-tab-1";

  return (
    <section
      id="services-top"
      className="relative overflow-hidden bg-secondary pb-28 pt-40"
    >
      {/* Masked dot grid — the same backdrop the careers and commitments
          heroes use, so the three sub-pages read as one site. `var(--border)`
          rather than a literal so it survives the dark theme. */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--border)_1.5px,transparent_1.5px)] bg-[size:26px_26px] [-webkit-mask-image:radial-gradient(ellipse_75%_60%_at_50%_35%,#000_10%,transparent_100%)] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_35%,#000_10%,transparent_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-32 right-0 size-[620px] translate-x-1/4 rounded-full bg-brand/15 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 size-[440px] -translate-x-1/3 translate-y-1/3 rounded-full bg-accent/15 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative z-10 shell">
        <div className="grid items-start gap-14 lg:grid-cols-12 lg:gap-16">
          {/* ---- the answer -------------------------------------------- */}
          <div
            id="mode-panel-hero"
            role="tabpanel"
            aria-labelledby={activeTab}
            className="lg:col-span-7"
          >
            <div
              data-reveal
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium leading-[1.5] shadow-sm"
            >
              <span className="text-accent-strong">
                <Icon name="layers" className="size-4" />
              </span>
              <span className="text-muted-foreground">
                {SERVICE_HERO.eyebrow}
              </span>
            </div>

            <h1
              data-reveal
              style={{ "--delay": "100ms" } as React.CSSProperties}
              className="font-display text-4xl font-medium leading-[1.1] tracking-[-0.025em] text-foreground md:text-5xl lg:text-[3.5rem]"
            >
              {SERVICE_HERO.head}{" "}
              {/* DS §3.3 / HANDOFF §5.13: the gradient is one inline span.
                  Splitting it across inline-block children puts them outside
                  the parent's background-clip and they render as nothing. */}
              <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
                {detail.heroAccent}
              </span>
            </h1>

            <p
              data-reveal
              style={{ "--delay": "200ms" } as React.CSSProperties}
              className="mt-6 max-w-2xl text-lg leading-[1.6] text-muted-foreground"
            >
              {detail.heroLead}
            </p>

            <div
              data-reveal
              style={{ "--delay": "300ms" } as React.CSSProperties}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <a
                href={`mailto:hello@interloid.com?subject=${encodeURIComponent(
                  detail.key === "build"
                    ? "New project — Interloid"
                    : "Engineers for our team — Interloid",
                )}`}
                className="group inline-flex h-14 items-center gap-2 rounded-full bg-primary px-8 text-[17px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-brand-light hover:shadow-primary/40 active:scale-95"
              >
                {detail.cta}
                <span className="transition-transform group-hover:translate-x-1">
                  <Icon name="arrow" className="size-5" />
                </span>
              </a>
              <a
                href="#capabilities"
                className="inline-flex h-14 items-center gap-2 rounded-full border border-border bg-card px-8 text-[17px] font-semibold text-foreground shadow-sm transition-all hover:border-accent/40 hover:shadow-md active:scale-95"
              >
                <Icon name="search" className="size-5 text-accent-strong" />
                See how we work
              </a>
            </div>
          </div>

          {/* ---- the question ------------------------------------------ */}
          <div
            data-reveal
            style={{ "--delay": "160ms" } as React.CSSProperties}
            className="lg:col-span-5"
          >
            <div className="rounded-[1.75rem] border border-border bg-card/70 p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,.35)] backdrop-blur-sm sm:p-7">
              <p className="mb-1 font-display text-[15px] font-bold tracking-[-0.015em] text-foreground">
                Which one are you?
              </p>
              <p className="mb-5 text-[13px] leading-[1.6] text-muted-foreground">
                {SERVICE_HERO.lead}
              </p>

              <ModeSwitch panelId="mode-panel-hero" />

              {/* The number, immediately. A visitor deciding whether to read
                  on is asking what this costs, and the shape of the answer
                  differs per mode — so it belongs with the choice, not four
                  sections later. Both figures are HANDOFF §7 claims. */}
              <div className="mt-5 flex items-baseline justify-between gap-4 rounded-2xl bg-muted px-5 py-4">
                <span className="font-display text-2xl font-bold tracking-[-0.02em] text-foreground">
                  {detail.figure}
                </span>
                <span className="text-right text-[13px] leading-[1.5] text-muted-foreground">
                  {detail.caption}
                </span>
              </div>
              <p className="mt-3 flex items-start gap-2 text-[13px] leading-[1.6] text-muted-foreground">
                <span className="mt-0.5 shrink-0 text-accent-strong">
                  <Icon name="check" className="size-4" />
                </span>
                In writing within 48 hours of the first call — and an honest no
                if the scope and the budget don&rsquo;t meet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
