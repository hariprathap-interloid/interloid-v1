"use client";

import Icon from "../Icon";
import SectionHeading from "../SectionHeading";
import { ModeSwitch, useServiceMode } from "./ModeContext";
import { SERVICE_MODES } from "@/content/service";

/* ==========================================================================
   THE ENGAGEMENT — the terms of the mode the visitor picked.
   ==========================================================================
   The reference's conversion section is a "4 Weeks to X" sprint ledger
   (SERVICE-PAGE-RESEARCH.md §2 P5): it shows the shape of the engagement
   before it asks for anything, which is why the ask lands. This is that
   move with our content — except that ours has to answer two different
   buyers, so it answers the one who identified themselves in the hero.

   ⚠ EVERY LINE HERE IS A CONTRACT TERM AND EVERY ONE IS ON HANDOFF §7's
   ALLOWED LIST. This is the section a client screenshots. Do not add a term
   that is not on that list — and if one has to be added, it needs the user's
   confirmation, not a data-placeholder, because a flagged contract term is
   still a published contract term to anyone reading with the toggle off.

   The second switch is here because a visitor who scrolled past the hero
   without touching it very often works out which they are exactly HERE, at
   the terms. The quiet link under the panel is the same move for the other
   direction — someone reading the wrong set of terms should be one obvious
   click from the right ones, not scrolling back a screen and a half.
   ========================================================================== */
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
                        <Icon name="check" className="size-4" />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* The number column. One honest figure instead of a pricing
                  table — the same device /why-choose-us uses for its clauses,
                  and the reason it works is that the sentence under it says
                  when the real number arrives. */}
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
                    continues — nothing is billed that you have not agreed in
                    advance.
                  </p>
                </div>

                <a
                  href={`mailto:hello@interloid.com?subject=${encodeURIComponent(
                    mode === "build"
                      ? "New project — Interloid"
                      : "Engineers for our team — Interloid",
                  )}`}
                  className="group mt-auto inline-flex h-14 items-center justify-center gap-2 rounded-full bg-primary px-8 text-[17px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-brand-light hover:shadow-primary/40 active:scale-95"
                >
                  {detail.cta}
                  <span className="transition-transform group-hover:translate-x-1">
                    <Icon name="arrow" className="size-5" />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* The way out, for somebody reading the wrong half. */}
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
