"use client";

import Link from "next/link";
import Icon from "../Icon";
import { ModeSwitch, useServiceMode } from "./ModeContext";
import { SERVICE_HERO } from "@/content/service";

/* /services hero.

   The right-hand column is the mode switch — the qualifying question whose
   answer changes the sections below.

   The copy column is the tabpanel the switch controls: the headline's
   gradient clause, the lead and the CTA label all come from the chosen mode.
   No aria-live is needed — tablist/tabpanel already tells assistive tech that
   selecting a tab replaces this region.

   Every [data-reveal] element keeps a static className and only its text
   children change (see ModeContext.tsx). */
export default function ServiceHero() {
  const { detail } = useServiceMode();
  const activeTab = detail.key === "build" ? "mode-tab-0" : "mode-tab-1";

  return (
    <section
      id="services-top"
      className="relative overflow-hidden bg-secondary pb-28 pt-40"
    >
      {/* Masked dot grid, shared with the other sub-page heroes.
          `var(--border)` rather than a literal so it follows the theme. */}
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
              {/* The gradient must be one inline span. Inline-block children
                  fall outside the parent's background-clip and render blank. */}
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
              <Link
                href={detail.ctaHref}
                className="group inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-brand-light hover:shadow-primary/40 active:scale-95 sm:h-14 sm:px-8 sm:text-[17px]"
              >
                <span className="sm:hidden">{detail.ctaShort}</span>
                <span className="hidden sm:inline">{detail.cta}</span>
                <span className="transition-transform group-hover:translate-x-1">
                  <Icon name="arrow" className="size-5" />
                </span>
              </Link>
              {/* `<a>` rather than `<Link>`: one of the targets is a same-page
                  `#hash`, which the browser handles better than the router. */}
              <a
                href={detail.secondary.href}
                className="inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full border border-border bg-card px-6 text-[15px] font-semibold sm:h-14 sm:px-8 sm:text-[17px] text-foreground shadow-sm transition-all hover:border-accent/40 hover:shadow-md active:scale-95"
              >
                <Icon
                  name={detail.secondary.icon}
                  className="size-5 text-accent-strong"
                />
                {detail.secondary.label}
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

              {/* The per-mode price figure, placed with the choice.

                  Figure and caption sit side by side only where the row's
                  ~262px fits. The card is not monotonic in viewport width: at
                  `lg` the hero splits 7/5 and this column narrows sharply. So
                  it stacks twice — below 420px and again across `lg`–`xl` —
                  and is a row elsewhere. Tailwind orders `min-[420px]` by
                  value, so the rules resolve 420 → lg → xl. */}
              <div className="mt-5 flex flex-col gap-1 rounded-2xl bg-muted px-5 py-4 min-[420px]:flex-row min-[420px]:items-baseline min-[420px]:justify-between min-[420px]:gap-4 lg:flex-col lg:items-start lg:gap-1 xl:flex-row xl:items-baseline xl:justify-between xl:gap-4">
                <span className="font-display text-2xl font-bold tracking-[-0.02em] text-foreground">
                  {detail.figure}
                </span>
                <span className="text-[13px] leading-[1.5] text-muted-foreground min-[420px]:text-right lg:text-left xl:text-right">
                  {detail.caption}
                </span>
              </div>
              <p className="mt-3 flex items-start gap-2 text-[13px] leading-[1.6] text-muted-foreground">
                <span className="mt-0.5 shrink-0 text-accent-strong">
                  <Icon name="check-circle" className="size-4" />
                </span>
                In writing within 48 hours of the first call, and an honest no
                if the scope and the budget don&rsquo;t meet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
