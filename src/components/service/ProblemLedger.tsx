"use client";

import { useState } from "react";
import Icon from "../Icon";
import SectionHeading from "../SectionHeading";
import { CAPABILITIES, SERVICE_PROBLEMS } from "@/content/service";

/* ==========================================================================
   WHERE TEAMS GET STUCK — the problem section, as a ledger of rows.
   ==========================================================================
   Rows rather than cards, deliberately: this page already spends its card
   budget on the hero switch and the engagement panel, and a fifth grid of
   cards is exactly the "repetitive grid" the brief rules out. A ledger also
   suits the content — these are five sentences a client says out loud, and
   they read as a list of sentences, not as five products.

   PROGRESSIVE DISCLOSURE IS THE POINT. The client's own words are always
   visible; our answer costs one click. A visitor scanning for themselves
   reads five short lines instead of five paragraphs, and the one that lands
   opens into a real answer — which is also the honest shape of the content,
   because the answers are only interesting once you have recognised the
   problem.

   ── THE THREE-ELEMENT RULE (Roles.tsx / Faq.tsx) ─────────────────────────
   <li data-reveal>   static className, forever — this is what Reveal observes
     <button>         owns the open/closed classes
     <div role=region> the disclosure, grid-rows 0fr→1fr

   React rewrites the whole className attribute on any state change, which
   would wipe the `is-in` Reveal.tsx wrote directly to the DOM — so nothing
   state-dependent may live on the [data-reveal] node. The panel is
   `invisible` as well as zero-height: a collapsed grid row still keeps its
   links in the tab order otherwise (HANDOFF §5.4).
   ========================================================================== */
export default function ProblemLedger() {
  /* First row open on load: an accordion where everything is shut reads as a
     list of unanswered complaints, which is the opposite of the intent. */
  const [open, setOpen] = useState<string | null>(SERVICE_PROBLEMS[0].q);

  const capOf = (k: string) => CAPABILITIES.find((c) => c.k === k);

  return (
    <section
      id="problems"
      className="relative overflow-hidden border-t border-border bg-background py-32"
    >
      <div
        className="pointer-events-none absolute right-0 top-0 size-[520px] -translate-y-1/3 translate-x-1/3 rounded-full bg-brand/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative z-10 shell">
        <SectionHeading
          eyebrow="The problem"
          icon="quote"
          accent="one of these five sentences."
          lead="Nobody books a call to buy “software development”. They book it because something specific has stopped working. Open the one that sounds like your quarter."
          className="max-w-3xl"
        >
          Almost every engagement starts with
        </SectionHeading>

        <ul className="flex flex-col">
          {SERVICE_PROBLEMS.map((p, i) => {
            const isOpen = open === p.q;
            const cap = capOf(p.to);
            return (
              <li
                key={p.q}
                data-reveal
                style={{ "--delay": `${i * 70}ms` } as React.CSSProperties}
              >
                <div className="border-t border-border last:border-b">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`problem-${i}`}
                      onClick={() => setOpen(isOpen ? null : p.q)}
                      className="group flex w-full items-start gap-5 py-7 text-left transition-colors sm:gap-7"
                    >
                      {/* The ghost numeral (DS §8.9's device) warms on hover
                          and turns solid when the row is open — the cheapest
                          possible state indicator, and it doubles as the
                          row's index. */}
                      <span
                        aria-hidden="true"
                        className={`shrink-0 font-display text-2xl font-bold tabular-nums transition-colors duration-300 ${
                          isOpen
                            ? "text-accent-strong"
                            : "text-faint group-hover:text-muted-foreground"
                        }`}
                      >
                        0{i + 1}
                      </span>
                      <span
                        className={`min-w-0 flex-1 font-display text-xl font-bold leading-[1.35] tracking-[-0.02em] transition-colors duration-300 sm:text-2xl ${
                          isOpen
                            ? "text-foreground"
                            : "text-muted-strong group-hover:text-foreground"
                        }`}
                      >
                        &ldquo;{p.q}&rdquo;
                      </span>
                      <span
                        aria-hidden="true"
                        className={`mt-1 grid size-9 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                          isOpen
                            ? "rotate-180 border-accent/40 bg-accent/10 text-accent-strong"
                            : "border-border text-muted-foreground group-hover:border-accent/40 group-hover:text-foreground"
                        }`}
                      >
                        <Icon name="chevron" className="size-4" />
                      </span>
                    </button>
                  </h3>

                  {/* 0fr → 1fr animates to the content's real height, where a
                      max-height needs a magic number that is wrong for every
                      panel (Faq.tsx's note). */}
                  <div
                    id={`problem-${i}`}
                    role="region"
                    className={`grid transition-all duration-300 ease-[cubic-bezier(.16,1,.3,1)] ${
                      isOpen ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="flex flex-col gap-6 pb-8 pl-11 sm:pl-[3.75rem] lg:flex-row lg:items-start lg:gap-12">
                        <p className="max-w-2xl text-[15px] leading-[1.75] text-muted-strong sm:text-base">
                          <span className="mr-2 text-[11px] font-bold uppercase tracking-[0.14em] text-accent-strong">
                            Our answer
                          </span>
                          {p.a}
                        </p>
                        {cap && (
                          <a
                            href="#capabilities"
                            className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-accent/40 hover:text-primary"
                          >
                            <Icon
                              name={cap.icon}
                              className="size-4 text-accent-strong"
                            />
                            {cap.name}
                            <span className="transition-transform group-hover:translate-x-1">
                              <Icon name="arrow" className="size-4" />
                            </span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
