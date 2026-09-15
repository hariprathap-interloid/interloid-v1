"use client";

import { usePointerLight } from "@/hooks/usePointerLight";

/* The Selected work card shell. A client component only for cursor tracking;
   everything inside it is server-rendered and passed through as children.

   ── data-reveal AND transition-* CANNOT SHARE AN ELEMENT ──────────────────
   `[data-reveal]` in globals.css sets `transition` outside any cascade layer,
   and unlayered CSS beats Tailwind's layered utilities, so a `transition-*`
   class on the same element silently loses and hover styles snap. The reveal
   goes on a wrapper; the hover stays on the card.

   ── NO HOVER LIFT ─────────────────────────────────────────────────────────
   Any translate or scale on the hovered element moves its own hit box out
   from under a pointer near its edge; `:hover` drops, the card moves back, and
   it flickers at frame rate. Padding, margin and size are the same trap. The
   hover changes colour and elevation only — box-shadow is not hit-tested.

   If anything here is animated later:
   1. Name the transitioned properties. `transition-all` animates every
      property that changes, several of them not composited.
   2. Tailwind v4 compiles `translate-*` and `scale-*` to the standalone
      `translate` and `scale` properties, so transition those, not `transform`.

   ── THE LIT BORDER ────────────────────────────────────────────────────────
   A frame whose brightest point follows the cursor, via the mask-composite
   trick: pad, subtract the content box, only the frame paints. It sits at
   `inset-0`, not outset, because the card is `overflow-hidden` and would clip
   an outset ring. `inset-0` resolves to the padding box, just inside the
   card's 1px border, so the ring is 2px and the static border goes
   transparent on hover — otherwise the two read as one thickened hairline
   instead of a change of colour.

   No wash inside the card: a tint under body copy costs contrast. The hover
   colour goes on the media plate instead (see Work.tsx), which carries no
   text.

   `cursor-pointer` implies a link: once real case studies exist, this
   <article> should become an <a> wrapping the same content. */
export default function WorkCard({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  const { ref, onPointerMove, onPointerLeave } = usePointerLight<HTMLElement>();

  return (
    /* The wrapper owns the reveal; the article owns the hover. See the note
       above before merging them. */
    <div
      data-reveal
      style={{ "--delay": `${index * 100}ms` } as React.CSSProperties}
      className="h-full"
    >
      <article
        ref={ref}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        data-placeholder="P0 TRUST: needs a real, anonymised case study"
        className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-border bg-card p-3 shadow-sm transition-[box-shadow,border-color] duration-300 ease-out hover:border-transparent hover:shadow-xl"
      >
        <div
          className="pointer-events-none absolute inset-0 z-10 rounded-3xl p-[2px] opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
          style={{
            background:
              /* The radius must cover the ~390x420 card: a smaller light
                 leaves most of the frame in the faint outer stops, paler than
                 the border it replaces, so the ring stops reading as lit. */
              "radial-gradient(520px circle at var(--x,50%) var(--y,50%)," +
              " color-mix(in oklab, var(--accent) 100%, transparent) 0%," +
              " color-mix(in oklab, var(--brand) 72%, transparent) 45%," +
              " color-mix(in oklab, var(--border) 90%, transparent) 85%," +
              " transparent 100%)",
            mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            maskComposite: "exclude",
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
          }}
          aria-hidden="true"
        />
        {children}
      </article>
    </div>
  );
}
