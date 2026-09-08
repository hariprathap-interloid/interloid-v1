"use client";

import { usePointerLight } from "@/hooks/usePointerLight";

/* The Selected work card shell. A client component only because of the cursor
   tracking — everything inside it is still server-rendered and passed through
   as children, so the card's content costs nothing on the client.

   ── data-reveal AND transition-* CANNOT SHARE AN ELEMENT ──────────────────
   Found 2026-09-07, and it is why the hover felt broken rather than merely
   plain. `[data-reveal]` in globals.css sets `transition: opacity .6s,
   transform .6s`, and it is written OUTSIDE any cascade layer while Tailwind's
   utilities live inside one. Unlayered always beats layered, so a
   `transition-*` class on the same element loses — silently, with no warning
   and nothing visibly broken at a glance.

   The consequence: on every card that carried both, only opacity and transform
   were ever transitioning. The hover shadow, border and background were
   SNAPPING, on a 500ms lift, which is exactly the "not smooth" symptom.
   `transition-all` hid it best of all, because it looks like it covers
   everything.

   The fix is structural, not a specificity fight: the reveal goes on a
   WRAPPER, the hover stays on the card. Two elements, two jobs, no collision.
   Do not put `data-reveal` back on an element that also has a hover
   transition.

   ── THERE IS NO LIFT, AND THERE MUST NOT BE ONE ───────────────────────────
   Removed 2026-09-07 after the user hit it: `hover:-translate-y-1.5` makes the
   card FLICKER along its bottom edge. The loop is self-sustaining and obvious
   once seen — the card translates up, which moves its own hit box out from
   under a pointer resting near that edge, so `:hover` drops, so it translates
   back down, so the pointer is inside again. It oscillates at frame rate for
   as long as the pointer sits in the 6px band the movement crosses.

   This is a property of hover-triggered geometry, not of the distance: any
   translate or scale on the hovered element itself re-enters the same loop at
   whatever its new edge is. Padding, margin and size are the same trap. So:
   the card's hover changes COLOUR AND ELEVATION ONLY — border, ring, plate
   tint, shadow. `box-shadow` is safe because a shadow is not hit-tested.

   The icon tile's `scale-110` went with it. It could not have caused the
   flicker (it is inside an `overflow-hidden` plate and cannot alter the card's
   bounds), but the rule reads better without an exception in it, and the
   colour signals carry the hover on their own — see the measurements below.

   Two things that WERE wrong with the old lift, kept here because they are
   live traps for whatever gets animated next:

   1. `transition-all duration-500` animates EVERY animatable property that
      changes, not the two that were meant — border colour, background, and
      every inherited colour on the children, a dozen properties on one clock,
      several not composited. Name the properties; it is also self-documenting,
      which `all` never is.
   2. Tailwind v4 compiles `-translate-y-*` and `scale-*` to the STANDALONE
      `translate` and `scale` properties, not to `transform`. A
      `transition-[transform,...]` therefore transitions a property that never
      changes, and the motion snaps while everything else eases behind it.
      Computed style read `transform: none; translate: 0px -4px`. If anything
      here ever animates again, name `translate`/`scale`, not `transform`.

   ── THE LIT BORDER ────────────────────────────────────────────────────────
   A 1px frame whose brightest point follows the cursor, using the standard
   mask-composite trick: pad by 1px, subtract the content box, only the frame
   paints. It sits at `inset-0` rather than CommitmentTile's `-inset-px`
   because this card is `overflow-hidden` and an outset ring would have its
   outer pixel clipped away.

   No wash inside the card. That is deliberate and it is the lesson from
   spotlight-lab.html: a tint under body copy costs contrast that this card
   does not have to spend. The hover's colour goes on the MEDIA PLATE instead
   (see Work.tsx) — it is the largest surface on the card and it carries no
   text, so it can take a tint for free.

   ── WHY THE RING IS 2px AND THE STATIC BORDER GOES TRANSPARENT ────────────
   Measured 2026-09-07, after the timing fix, because the hover still did not
   READ. A pixel diff of idle vs hover showed 11% of pixels changing — which
   sounds healthy until you see where: the change box was the whole card,
   i.e. it was the 4px lift shifting every edge and glyph, and NOTHING ELSE.
   No new signal appeared.

   The ring was the reason. At `p-px` it is a 1px line, and `inset-0` on an
   absolutely positioned child resolves to the PADDING box — so it landed
   1px inside the card's own 1px `border-border` and read as a hairline
   thickening of a border that was simultaneously fading to /40. The two
   cancelled. Widening to 2px and taking the static border to `transparent`
   on hover leaves the lit ring as the only edge, so the card's outline
   visibly changes colour instead of merely changing weight.

   It cannot be solved by moving the ring outward to `-inset-px` the way
   CommitmentTile does: this card is `overflow-hidden`, so an outset ring
   loses its outer pixel to the clip.

   `cursor-pointer` is here because the card reads as clickable. NOTE: it is an
   `<article>`, not a link — when the real case studies land (HANDOFF §7 P0)
   this should become an `<a>` wrapping the same content, at which point the
   cursor stops being a promise the markup does not keep. */
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
       above before merging these back together. */
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
              /* 520px, not 300px: the card is ~390x420, so a 300px light
                 left almost the whole frame sitting in the two faint outer
                 stops — sampled at 207,219,233 against the card's own border
                 at 226,232,240, i.e. the "lit" ring was paler than the border
                 it replaced. The radius has to cover the card for the ring to
                 read as lit rather than as a slightly different grey. */
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
