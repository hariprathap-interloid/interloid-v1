"use client";

import { useRef } from "react";
import Icon from "../Icon";
import SectionHeading from "../SectionHeading";
import TechLogo from "./TechLogo";
import { CAPABILITIES, STACK_HEADING } from "@/content/service";
import { HUE } from "@/content/site";

/* ==========================================================================
   TECHNOLOGY STACKS — interloid.com's #technologies section, rebuilt.
   ==========================================================================
   The live section is a six-tab carousel: one tab per service, each showing
   grouped technologies with their logos. That structure is right and is kept
   — a visitor evaluating a firm wants to know what a specific service is
   built on, not to read one undifferentiated list of forty logos.

   Three things are done differently, and all three are house rules:

     1. NO EMOJI. The live tabs are labelled with 💻 📱 ⚙️ ☁️ 🤖 👥.
        CLAUDE.md §3.6 bans emoji as iconography and the review calls it the
        most visible unpolish on the live site; the tabs take Lucide glyphs
        and the technologies take their real marks (see TechLogo.tsx).
     2. A TABLIST, NOT A CAROUSEL. The live version pairs the tabs with
        prev/next slide buttons, so keyboard users get two competing models
        for the same control. This is one ARIA tablist with a roving
        tabindex: Arrow keys move, and the panel is properly associated.
     3. NO UNMOUNTING. All six panels stay in the DOM and the inactive ones
        are `hidden` — Reveal.tsx observes [data-reveal] once on mount, so a
        panel created later by a tab press would never be observed and would
        sit at opacity 0 forever. Same rule as Roles.tsx's filter.

   The section sits AFTER the capability showcase on purpose: by then a
   visitor knows what each service does, so the stack answers "what is it
   built on" rather than being the argument itself. Technology supports the
   story; it is not the story.
   ========================================================================== */
export default function TechStacks({
  active,
  onChange,
}: {
  /** CONTROLLED, not self-owned: the "whole stack" link inside each
      capability block selects the matching tab here, so a reader who was
      reading about Mobile lands on Mobile's stack rather than on whichever
      tab happened to be open. CapabilitiesAndStacks owns the value. */
  active: number;
  onChange: (i: number) => void;
}) {
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const delta: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    };
    if (!(e.key in delta)) return;
    e.preventDefault();
    const next =
      (active + delta[e.key] + CAPABILITIES.length) % CAPABILITIES.length;
    onChange(next);
    tabs.current[next]?.focus();
  };

  return (
    <section
      id="technologies"
      className="relative border-t border-border bg-background py-32"
    >
      {/* The orb is clipped by its own wrapper rather than by the section:
          `overflow-hidden` on a section makes it a scroll container and kills
          any sticky descendant (see CapabilityShowcase's note and
          TAILWIND-MAP §4c). Keeping the habit consistent across the page. */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute right-0 top-1/4 size-[560px] translate-x-1/3 rounded-full bg-brand/10 blur-[120px]" />
      </div>

      <div className="relative z-10 shell">
        <SectionHeading
          eyebrow={STACK_HEADING.eyebrow}
          icon="layers"
          accent={STACK_HEADING.accent}
          lead={STACK_HEADING.lead}
          className="max-w-3xl"
        >
          {STACK_HEADING.head}
        </SectionHeading>

        {/* ---- the tabs ------------------------------------------------- */}
        <div
          role="tablist"
          aria-label="Technology stacks by service"
          className="mb-10 flex flex-wrap gap-2"
          onKeyDown={onKeyDown}
        >
          {CAPABILITIES.map((c, i) => {
            const on = i === active;
            return (
              <button
                key={c.k}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                id={`stack-tab-${i}`}
                role="tab"
                type="button"
                aria-selected={on}
                aria-controls={`stack-panel-${i}`}
                tabIndex={on ? 0 : -1}
                onClick={() => onChange(i)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-[background-color,border-color,color,box-shadow] duration-200 ${
                  on
                    ? "border-transparent bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground"
                }`}
              >
                <Icon name={c.icon} className="size-4" />
                {c.name}
              </button>
            );
          })}
        </div>

        {/* ---- the panels ----------------------------------------------- */}
        <div data-reveal>
          {CAPABILITIES.map((c, i) => {
            const h = HUE[c.hue];
            return (
              <div
                key={c.k}
                id={`stack-panel-${i}`}
                role="tabpanel"
                aria-labelledby={`stack-tab-${i}`}
                /* hidden, never unmounted — see the banner. */
                className={i === active ? "" : "hidden"}
              >
                <div className="relative overflow-hidden rounded-4xl border border-border bg-card p-8 shadow-[0_30px_80px_-15px_rgba(15,23,42,.12)] ring-1 ring-foreground/5 sm:p-10">
                  <div
                    className={`pointer-events-none absolute right-0 top-0 size-72 -translate-y-1/3 translate-x-1/3 rounded-full blur-[90px] ${h.glow}`}
                    aria-hidden="true"
                  />

                  <div className="relative z-10">
                    <div className="mb-8 flex flex-col gap-4 border-b border-hairline pb-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
                      <div className="flex items-center gap-4">
                        <span
                          className={`grid size-12 shrink-0 place-items-center rounded-2xl text-white shadow-lg ${h.tile}`}
                        >
                          <Icon name={c.icon} className="size-6" />
                        </span>
                        <h3 className="font-display text-xl font-bold leading-[1.25] tracking-[-0.02em] text-foreground sm:text-2xl">
                          {c.name}
                        </h3>
                      </div>
                      <p className="max-w-2xl text-[15px] leading-[1.7] text-muted-foreground">
                        {c.stackNote}
                      </p>
                    </div>

                    <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
                      {c.stack.map((g) => (
                        <div key={g.group}>
                          <h4 className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                            {g.group}
                          </h4>
                          <ul className="flex flex-col gap-2.5">
                            {g.items.map((t) => (
                              <li
                                key={t.name}
                                className="group flex items-center gap-3"
                              >
                                <TechLogo tech={t} />
                                <span className="text-[14px] font-medium text-muted-strong transition-colors group-hover:text-foreground">
                                  {t.name}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p
          data-reveal
          style={{ "--delay": "120ms" } as React.CSSProperties}
          className="mt-6 flex items-start gap-2.5 text-[15px] leading-[1.7] text-muted-foreground"
        >
          <span className="mt-0.5 shrink-0 text-accent-strong">
            <Icon name="check" className="size-5" />
          </span>
          <span>
            Every stack above is one we run in production today. Where your
            team already has a stack, we work in it — the list is what we
            reach for, not what we insist on.
          </span>
        </p>
      </div>
    </section>
  );
}
