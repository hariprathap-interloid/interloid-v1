"use client";

import Link from "next/link";
import Icon from "../Icon";
import SectionHeading from "../SectionHeading";
import { ModeSwitch, useServiceMode } from "./ModeContext";
import { SERVICE_MODES } from "@/content/service";

/* The engagement terms for the selected mode, shown before any ask.

   Every line here reads as a contract term. Do not add one that has not been
   confirmed — a data-placeholder flag does not help, because a flagged term is
   still a published term to anyone reading with the toggle off.

   A second switch sits here, and a link under the panel flips to the other
   mode, so a reader on the wrong terms is one click from the right ones. */
export default function EngagementPanel() {
  const { mode, detail, setMode } = useServiceMode();
  const other = SERVICE_MODES.find((m) => m.key !== mode) ?? SERVICE_MODES[1];
  const activeTab = mode === "build" ? "engage-tab-0" : "engage-tab-1";

  return (
    <section
      id="engagement"
      className="relative overflow-hidden border-t border-border bg-secondary py-32"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-0 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative z-10 shell">
        <SectionHeading
          eyebrow="The engagement"
          icon="handshake"
          accent="before you're asked for anything."
          lead="No discovery workshop to find out what it costs, and no proposal-shaped sales process. These are the terms of the engagement you picked, in the same words they appear in the agreement."
          className="max-w-3xl"
        >
          What you are agreeing to,
        </SectionHeading>

        <div data-reveal className="mb-8">
          <ModeSwitch
            panelId="engage-panel"
            size="sm"
            idPrefix="engage"
          />
        </div>

        <div
          data-reveal
          style={{ "--delay": "80ms" } as React.CSSProperties}
        >
          <div
            id="engage-panel"
            role="tabpanel"
            aria-labelledby={activeTab}
            className="relative overflow-hidden rounded-4xl border border-border bg-card shadow-[0_30px_80px_-15px_rgba(15,23,42,.12)] ring-1 ring-foreground/5"
          >
            <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-7">
                <div className="mb-6 flex items-center gap-4">
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                    <Icon name={detail.icon} className="size-7" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-strong">
                      {detail.label}
                    </p>
                    <h3 className="mt-1 font-display text-2xl font-bold leading-[1.2] tracking-[-0.02em] text-foreground md:text-[1.75rem]">
                      {detail.title}
                    </h3>
                  </div>
                </div>

                <p className="mb-8 max-w-xl text-[17px] leading-[1.7] text-muted-foreground">
                  {detail.who}
                </p>

                <h4 className="mb-4 flex items-center gap-2 font-display text-[12px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  <Icon name="doc" className="size-4 text-accent-strong" />
                  The terms
                </h4>
                <ul className="space-y-3.5">
                  {detail.terms.map((t) => (
                    <li
                      key={t}
                      className="flex gap-3 text-[15px] leading-[1.7] text-muted-strong"
                    >
                      <span className="mt-0.5 shrink-0 text-accent-strong">
                        <Icon name="check-circle" className="size-4" />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* One figure instead of a pricing table, with the sentence
                  under it saying when the real number arrives. */}
              <div className="flex flex-col gap-6 lg:col-span-5">
                <div className="rounded-[1.5rem] border border-border bg-background p-8 text-center">
                  <p className="font-display text-[2.75rem] font-bold leading-none tracking-[-0.03em] text-foreground">
                    {detail.figure}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {detail.caption}
                  </p>
                  <p className="mt-6 border-t border-hairline pt-6 text-[13px] leading-[1.7] text-muted-foreground">
                    Your number is in writing within 48 hours of the first
                    call. Scope changes are quoted and approved before work
                    continues. Nothing is billed that you have not agreed in
                    advance.
                  </p>
                </div>

                <div className="mt-auto flex flex-col gap-3">
                  <Link
                    href={detail.ctaHref}
                    className="group inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-brand-light hover:shadow-primary/40 active:scale-95 sm:h-14 sm:px-8 sm:text-[17px]"
                  >
                    <span className="sm:hidden">{detail.ctaShort}</span>
                    <span className="hidden sm:inline">{detail.cta}</span>
                    <span className="transition-transform group-hover:translate-x-1">
                      <Icon name="arrow" className="size-5" />
                    </span>
                  </Link>
                  {/* Same secondary link as the hero. */}
                  <a
                    href={detail.secondary.href}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full text-[15px] font-semibold text-primary transition-colors hover:text-accent-strong"
                  >
                    <Icon
                      name={detail.secondary.icon}
                      className="size-4 text-accent-strong"
                    />
                    {detail.secondary.label}
                    <Icon name="arrow" className="size-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Switch to the other mode. */}
        <p
          data-reveal
          style={{ "--delay": "160ms" } as React.CSSProperties}
          className="mt-6 text-[15px] text-muted-foreground"
        >
          Actually the other case?{" "}
          <button
            type="button"
            onClick={() => setMode(other.key)}
            className="inline-flex items-center gap-1.5 rounded-full font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:text-accent-strong"
          >
            {other.label}
            <Icon name="arrow" className="size-4" />
          </button>
        </p>
      </div>
    </section>
  );
}
