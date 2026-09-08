"use client";

import { useState } from "react";
import Icon from "./Icon";
import { CAREER_FAQ } from "@/content/site";

/* Candidate FAQ.

   ── WHY THIS IS NOT Faq.tsx WITH PROPS ────────────────────────────────────
   Faq.tsx was measured property-by-property against prototype 1 and matches
   it. Parameterising it would mean changing a component that is currently
   provable, for a second caller — and the shared part is about forty lines of
   accordion, while the differing part is the content, the heading, the
   backdrop and the section ground. That trade was made the other way for
   CtaAnchor (every prop defaults to home's copy, so home renders byte-for-byte
   what it rendered before) because there the shared part was a 200-line slab
   with a WebGL stage. Here it is not worth the risk.

   What IS copied deliberately, and must stay copied, is the accordion's two
   hard-won details — both documented at length in Faq.tsx:

     · grid-template-rows 0fr → 1fr, never max-height. It animates to the
       content's real height and stays correct when the copy changes.
     · `invisible` on the collapsed row as well as zero height, or the answer
       keeps its text in the a11y tree.

   And the structural rule: the reveal wrapper and the element whose className
   depends on state are DIFFERENT NODES. React rewrites the whole className
   attribute on a state change and would wipe the `is-in` that Reveal.tsx put
   there directly — the bug where opening a card made it vanish. */
export default function CareerFaq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      id="career-faq"
      className="relative overflow-hidden border-t border-border bg-background py-32"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--border)_1.5px,transparent_1.5px)] bg-[size:24px_24px] [-webkit-mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)]"
        aria-hidden="true"
      />
      <div className="relative z-10 shell">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2
            data-reveal
            className="font-display text-4xl font-medium leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl"
          >
            Things people ask{" "}
            <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
              before applying.
            </span>
          </h2>
          <p
            data-reveal
            style={{ "--delay": "80ms" } as React.CSSProperties}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            The questions that usually wait until the third call, answered
            before the first one.
          </p>
        </div>

        <div className="mx-auto flex max-w-[52rem] flex-col gap-4">
          {CAREER_FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                data-reveal
                style={{ "--delay": `${i * 60}ms` } as React.CSSProperties}
              >
                <div
                  className={`overflow-hidden rounded-[1rem] border bg-card transition-[border-color,box-shadow] duration-300 ${
                    isOpen
                      ? "border-border shadow-md"
                      : "border-hairline hover:border-border hover:shadow-sm"
                  }`}
                >
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`cfaq-a-${i}`}
                      id={`cfaq-q-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      /* The card clips overflow to round its corners, which
                         would crop an outward focus ring — so this one is
                         inset (HANDOFF §5.5). */
                      className="flex w-full items-center justify-between gap-6 rounded-[1rem] p-6 text-left font-display text-[17px] font-semibold text-foreground focus-visible:shadow-[inset_0_0_0_2px_var(--ring)]"
                    >
                      {f.q}
                      <span
                        className={`shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-primary" : "text-muted-foreground"
                        }`}
                      >
                        <Icon name="chevron" className="size-5" />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`cfaq-a-${i}`}
                    role="region"
                    aria-labelledby={`cfaq-q-${i}`}
                    className={`grid transition-all duration-300 ease-[cubic-bezier(.16,1,.3,1)] ${
                      isOpen ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-6 leading-[1.7] text-muted-foreground">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
