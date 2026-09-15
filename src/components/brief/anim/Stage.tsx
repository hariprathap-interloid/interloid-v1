"use client";

import MarkField from "./MarkField";

/* The panel beside the thank-you once a story is sent: the Interloid mark
   gathers from particles. It fills its half of the combined card. The caption
   carries the same state as words, so nothing is said by motion alone. */
export default function Stage() {
  return (
    <figure className="m-0 flex h-full flex-col bg-ink">
      {/* Never shorter than 18rem: smaller, the particle lattice aliases. */}
      <div className="relative min-h-72 flex-1 lg:min-h-[26rem]">
        <MarkField progress={1} done />
      </div>
      <figcaption className="border-t border-white/10 px-5 py-3.5" aria-live="polite">
        <span className="flex items-baseline justify-between gap-3 text-[13px] text-ink-foreground">
          <span>Delivered safely to the Interloid team.</span>
          <span className="shrink-0 tabular-nums">100%</span>
        </span>
        <span className="mt-2 block h-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
          <span className="block h-full w-full rounded-full bg-gradient-to-r from-brand-light to-accent" />
        </span>
      </figcaption>
    </figure>
  );
}
