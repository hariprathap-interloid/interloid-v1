"use client";

import { useState } from "react";
import Icon from "./Icon";
import { FAQ } from "@/content/site";

/* "Questions we get every week." Converted from prototype/'s accordion.

   This is the single most valuable unblocked section on the page. The review's
   core finding is that the site asks for trust while showing no proof; an FAQ
   is proof-by-transparency — the only kind that needs nobody's permission.
   Prototype 1's subhead says exactly why it works.

   The open/close animation is grid-template-rows 0fr -> 1fr, not max-height.
   max-height needs a magic number that is wrong for every answer; 0fr->1fr
   animates to the content's real height and stays correct if the copy changes.

   `visibility` is on the row too, not just height: a collapsed panel that is
   only zero-height still keeps its text in the accessibility tree and (with
   any focusable content) in the tab order — the same trap as HANDOFF §5.4.

   The button carries an INSET focus ring: the item clips overflow to round its
   corners, which would crop an outward ring (HANDOFF §5.5).

   ── REACT'S className WIPES Reveal'S `is-in` — THE CARD VANISHED ───────────
   Found 2026-09-07 from the user's report: opening an item made that item
   DISAPPEAR. Measured — the clicked card went `is-in: true -> false`,
   opacity 1 -> 0.01, while still correctly expanding 76px -> 181px. It was
   opening; it was just invisible while it did.

   Reveal.tsx adds `is-in` with `classList.add`, straight onto the DOM. React
   owns the `className` attribute on that same element, and on a state change
   it writes the whole attribute — which does not contain `is-in`, because
   React never knew about it. So `[data-reveal] { opacity: 0 }` reapplied.

   Only the clicked card, and that detail is the proof rather than a curiosity:
   React diffs the className string and skips the DOM write when it is
   unchanged, so the five cards whose classes did not change kept their
   `is-in`. Any card whose class string changed lost it.

   This is the SAME collision as WorkCard's, one layer up — there the conflict
   was CSS specificity, here it is ownership of the attribute. The fix is the
   same and it is structural: the wrapper reveals, the inner card carries the
   state classes. NEVER put `data-reveal` on an element whose className is
   computed from React state. That rule holds for any client component on this
   page. */
export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="relative overflow-hidden border-t border-border bg-secondary py-32"
    >
      {/* Dot-grid backdrop — DS §2.6, and prototype 1 has it on exactly this
          section (`.grid-backdrop` on #faq and #work). The radial mask is the
          whole point: an unmasked grid tiles to a hard edge at the section
          boundary and reads as a texture that was cut off, so it fades out
          before it gets there.

          `var(--border)` where DS hardcodes `#e2e8f0`. DS is written for the
          light theme only; the token is that same slate-200 in light and
          `white/10` in dark, so one class works in both. A literal would have
          left the dots invisible on the dark ground. */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--border)_1.5px,transparent_1.5px)] bg-[size:24px_24px] [-webkit-mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)]"
        aria-hidden="true"
      />
      <div className="relative z-10 shell">
        {/* max-w-3xl, not 2xl: at 2xl the H2 orphaned "week." onto its own
            line. The intro keeps its own narrower measure below. */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2
            data-reveal
            className="font-display text-4xl font-medium leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl"
          >
            Questions we get{" "}
            <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
              every week.
            </span>
          </h2>
          <p
            data-reveal
            style={{ "--delay": "80ms" } as React.CSSProperties}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            The answers most agencies make you sit through a sales call to hear.
          </p>
        </div>

        <div /* `.faq`: 52rem, wider than max-w-3xl's 48rem. */
          className="mx-auto flex max-w-[52rem] flex-col gap-4">
          {FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              /* Wrapper reveals, inner card carries the open/closed classes.
                 They CANNOT be the same element — see the note above. */
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
                      aria-controls={`faq-a-${i}`}
                      id={`faq-q-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
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
                    id={`faq-a-${i}`}
                    role="region"
                    aria-labelledby={`faq-q-${i}`}
                    className={`grid transition-all duration-300 ease-[cubic-bezier(.16,1,.3,1)] ${
                      isOpen
                        ? "visible grid-rows-[1fr]"
                        : "invisible grid-rows-[0fr]"
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
