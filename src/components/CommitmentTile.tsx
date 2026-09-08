"use client";

import { usePointerLight } from "@/hooks/usePointerLight";
import Icon from "./Icon";

/* Prototype 1's `.tile` — the Why Interloid bento cell, shared by the home
   section and /why-choose-us.

   Converted rather than copied. Three things about it are deliberate and easy
   to lose:

   1. NO PER-HUE COLOUR. Every icon plate is white-on-white with a brand-blue
      glyph, whatever the tile says. prototype3's bento tinted each plate by
      category (DS §2.3 "one hue per category"); prototype 1 does not, and the
      restraint is why the grid reads as one object instead of five stickers.
      This is a deliberate deviation from §2.3 for this section only.

   2. THE SPOTLIGHT IS THEMED, AND IT IS MEANT TO BE SEEN — changed 2026-09-07.
      It was prototype 1's 650px of rgba(31,93,160,.05), which is subliminal to
      the point of looking broken. Two layers, both driven by --x/--y:
        - a full-tile wash, unmasked, accent into brand
        - a 1px gradient-border ring, lit where the cursor is

      Both use color-mix over --brand / --accent instead of literal rgba, so
      the effect follows the theme — the old hard-coded #1f5da0 stayed a
      light-mode blue on a dark card. The ring uses the mask-composite border
      trick: pad 1px, subtract the content box, only the frame paints.

      WHY THE BODY COPY IS slate-600 AND NOT --muted-foreground. The wash is
      unmasked, so it sits under the paragraph, and slate-500 on this tile's
      hover ground measures 4.69:1 — 0.19 over AA, no headroom at all. An 18%
      wash took it to 3.57:1. Two intermediate fixes were tried and rejected:
      masking the wash off the lower half (kills the look that was actually
      wanted) and pre-mixing the hue paler at higher alpha, which
      spotlight-lab.html proved is the SAME wash — mix(hue, card, t) at alpha a
      is hue at alpha a(1-t), so 60% of a 70% tint is 18% and measures 3.60:1.
      Tint and opacity are one number, not two levers.

      Darkening the copy is the lever that works: slate-600 starts at 7.5:1, so
      the wash has somewhere to spend. What ships is lab variant A2 — accent
      into brand, 20% effective at the core — which measures 6.06:1 on light
      and 8.70:1 on dark. The tile is also
      more readable at rest, which is a free win. It ships as a new token,
      --muted-strong (globals.css), whose dark value is slate-300 — the first
      draft used `dark:text-slate-300` and that was a bug: dark is a `.dark`
      CLASS here, v4's `dark:` follows prefers-color-scheme, and the utility
      compiled fine while never firing. The dark tile rendered slate-600 copy
      on a near-black card. Use tokens for anything that changes with theme.

      Before touching either gradient, open spotlight-lab.html and read the
      number. The five stops below are the lab's own output, pasted: hue
      accent -> brand, strength 20%, radius 460.

   2b. SMOOTHNESS. The spotlight centre is LERPED toward the pointer in a rAF
      loop rather than written straight from the event, so the light glides and
      settles instead of snapping frame-for-frame with the cursor. The gradient
      also carries five eased stops rather than two: a two-stop radial this
      large bands visibly on a near-flat card, and the extra stops leave the
      ramp no straight segment for the banding to latch onto.

      The loop writes CSS custom properties only. It must never become a CSS
      transition on the gradient — that re-rasterises the whole layer every
      frame — and per HANDOFF §5.14 it must not touch `transform`, which would
      cancel the plate's hover scale. It lives in usePointerLight now, shared
      with WorkCard.

   ── data-reveal AND transition-* CANNOT SHARE AN ELEMENT ──────────────────
   Found 2026-09-07. `[data-reveal]` in globals.css sets `transition: opacity
   .6s, transform .6s`, and it is written OUTSIDE any cascade layer while
   Tailwind's utilities live inside one. Unlayered beats layered, so a
   `transition-*` class on the same element loses — silently.

   The consequence here: only opacity and transform ever transitioned. This
   tile's hover background, border and shadow were SNAPPING on a 500ms lift.
   `transition-all` hid it best of all, because it looks like it covers
   everything.

   The fix is structural, not a specificity fight: the reveal goes on a
   WRAPPER, the hover stays on the tile. Do not put `data-reveal` back on an
   element that also has a hover transition.

   3. WIDE TILES LIE DOWN. A `lg:col-span-2` tile is ~810px wide holding two
      lines of copy, so stacking the plate above the title left 59-86px of
      forced gap (measured in why-interloid-lab.html, layout A). At lg the wide
      form turns into a row — plate beside the copy — which spends the extra
      width instead of padding the height. Narrow viewports keep the stack,
      because there is no spare width to spend there.

      `lg:min-h-[18rem]` is prototype 1's 18rem proportion kept as a FLOOR. It
      replaced `lg:auto-rows-[18rem]` on the grid, which was a fixed track and
      cut copy between 1024 and 1280px — see the note in Advantage.tsx.

   4. GLASS, NOT CARD. bg-white/60 over a tinted section with a 16px backdrop
      blur — the section's orbs are meant to show through. A solid `bg-card`
      kills the effect entirely.

   It writes CSS custom properties rather than animating anything: HANDOFF
   §5.14, a keyframe touching `transform` replaces the whole property and would
   cancel the hover scale. */
export type Commitment = {
  k: string;
  title: string;
  body: string;
  span?: string;
};

export default function CommitmentTile({
  item,
  index = 0,
  wide = false,
}: {
  item: Commitment;
  index?: number;
  /** prototype 1's `.tile--wide`: spans two columns and steps the title from
   *  1.375rem to 1.75rem. Only ever use ONE, and only when the tile count
   *  still fills the grid — see the note in content/site.ts. */
  wide?: boolean;
}) {
  /* Was ~45 lines of inline rAF here. Moved to usePointerLight on 2026-09-07
     when WorkCard needed the same thing — see that hook for why the lerp, the
     self-parking loop and the reduced-motion opt-out are the parts that
     matter. Behaviour is unchanged except that reduced motion is now honoured,
     which it was not before. */
  const { ref, onPointerMove, onPointerLeave } = usePointerLight<HTMLElement>();

  return (
    /* Wrapper reveals, article hovers — see the note above. The column span
       moves out here too, because the wrapper is now the grid item. */
    <div
      data-reveal
      style={{ "--delay": `${index * 100}ms` } as React.CSSProperties}
      className={`h-full ${wide ? "lg:col-span-2" : ""}`}
    >
      <article
        ref={ref}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-[1.5rem] border border-border/80 bg-card/60 p-8 shadow-[0_20px_35px_-20px_rgba(15,23,43,.25)] backdrop-blur-[16px] transition-[background-color,border-color,box-shadow] duration-500 ease-out lg:min-h-[18rem] hover:border-border hover:bg-card/85 hover:shadow-[0_28px_50px_-20px_rgba(31,93,160,.22)] ${
          wide ? "lg:flex-row lg:items-center lg:gap-8" : ""
        }`}
      >
        {/* Layer 1 - the wash. Five stops, unmasked; see 2 and 2b above. */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[1.5rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(460px circle at var(--x,50%) var(--y,50%)," +
              " color-mix(in oklab, var(--accent) 20%, transparent) 0%," +
              " color-mix(in oklab, var(--accent) 16%, transparent) 28%," +
              " color-mix(in oklab, var(--brand) 4.2%, transparent) 52%," +
              " color-mix(in oklab, var(--brand) 1.5%, transparent) 74%," +
              " transparent 100%)",
          }}
          aria-hidden="true"
        />

        {/* Layer 2 - the lit edge. `p-px` + exclude gives a 1px frame without a
          second element; `-inset-px` keeps it outside the tile's own border so
          the two do not sit on the same pixel and shimmer. */}
        <div
          className="pointer-events-none absolute -inset-px rounded-[1.5rem] p-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(520px circle at var(--x,50%) var(--y,50%), color-mix(in oklab, var(--accent) 75%, transparent), color-mix(in oklab, var(--brand) 30%, transparent) 45%, transparent 78%)",
            mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            maskComposite: "exclude",
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
          }}
          aria-hidden="true"
        />

        <div /* shrink-0 is load-bearing: the tile is a flex column inside a fixed
         18rem row, so on a tile with long copy the plate gets squashed —
         measured 44.9px instead of 56px before this. */
          className={`relative z-10 mb-8 grid size-14 shrink-0 place-items-center rounded-[1rem] border border-white bg-card/85 text-brand shadow-sm backdrop-blur-[8px] transition-transform duration-500 group-hover:scale-110 ${
            wide ? "lg:mb-0" : ""
          }`}
        >
          <Icon name={item.k} className="size-6" />
        </div>

        <div className={`relative z-10 mt-auto ${wide ? "lg:mt-0" : ""}`}>
          <h3
            className={`mb-3 font-display font-bold leading-[1.5] tracking-[-0.025em] text-foreground ${
              wide ? "text-[1.75rem]" : "text-[1.375rem]"
            }`}
          >
            {item.title}
          </h3>
          {/* font-weight 500 on the body is prototype 1's, not an accident —
            it holds up against the glass ground where 400 goes muddy.
            --muted-strong rather than --muted-foreground is what pays for
            the unmasked wash — read 2 above before changing it back. It is a
            token, not `dark:text-slate-300`: dark is a CLASS in this app and
            Tailwind v4's `dark:` follows prefers-color-scheme, so the utility
            form compiles and then never fires. */}
          <p className="font-medium leading-[1.65] text-muted-strong">
            {item.body}
          </p>
        </div>
      </article>
    </div>
  );
}
