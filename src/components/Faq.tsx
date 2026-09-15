"use client";

import { useState } from "react";
import Icon from "./Icon";
import { FAQ } from "@/content/site";

/* "Questions we get every week." — an accordion.

   The open/close animation is grid-template-rows 0fr -> 1fr, not max-height:
   it animates to the content's real height with no magic number.

   `visibility` toggles along with the height: a zero-height panel would still
   keep its text in the accessibility tree and any focusable content in the
   tab order.

   The button carries an INSET focus ring: the item clips overflow to round its
   corners, which would crop an outward ring.

   ── NEVER PUT data-reveal ON AN ELEMENT WITH A STATE-DRIVEN className ─────
   Reveal adds `is-in` with classList, outside React. When a state change
   alters an element's className, React rewrites the whole attribute and drops
   `is-in`, so `[data-reveal] { opacity: 0 }` reapplies and the card vanishes.
   The wrapper reveals; the inner card carries the state classes. */
export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="relative overflow-hidden border-t border-border bg-secondary py-32"
    >
      {/* Dot-grid backdrop. The radial mask fades it out before the section
          edge; unmasked, the grid tiles to a hard edge and reads as a texture
          that was cut off. `var(--border)` rather than a literal so the dots
          stay visible on the dark ground. */}
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

        <div /* 52rem: a little wider than the heading's max-w-3xl (48rem). */
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
