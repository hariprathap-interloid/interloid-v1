"use client";

import { usePointerLight } from "@/hooks/usePointerLight";
import Icon from "./Icon";

/* The Why Interloid bento cell, shared by the home section and /why-choose-us.

   1. NO PER-HUE COLOUR. Every icon plate carries the same brand-blue glyph,
      whatever the tile says, so the grid reads as one object.

   2. THE SPOTLIGHT. Two layers, both driven by --x/--y:
        - a full-tile wash, unmasked, accent into brand
        - a 1px gradient-border ring, lit where the cursor is
      Both use color-mix over --brand / --accent so they follow the theme. The
      ring uses the mask-composite border trick: pad 1px, subtract the content
      box, only the frame paints.

      WHY THE BODY COPY IS --muted-strong, NOT --muted-foreground. The wash
      sits under the paragraph, and --muted-foreground on the hover ground has
      almost no headroom over AA. Tint and opacity are one number, not two
      levers: mix(hue, card, t) at alpha a equals hue at alpha a(1-t), so a
      paler hue at higher alpha is the same wash. Darkening the copy is the
      lever that works — with this wash (20% effective at the core) the copy
      holds ~6:1 on light and ~8.7:1 on dark. It is a token rather than a
      `dark:` utility because dark mode is a `.dark` class here, while Tailwind
      v4's `dark:` follows prefers-color-scheme and would never fire.

   2b. SMOOTHNESS. usePointerLight lerps the centre toward the pointer in a rAF
      loop, so the light glides instead of snapping. The wash has five eased
      stops because a two-stop radial this large bands visibly on a near-flat
      card. Only custom properties are written: a CSS transition on the
      gradient would re-rasterise the layer every frame, and touching
      `transform` would cancel the plate's hover scale.

   3. WIDE TILES LIE DOWN. A two-column tile holds only two lines of copy, so
      at lg it becomes a row (plate beside copy) instead of padding its height.
      `lg:min-h-[18rem]` is a floor, never a fixed height: narrow lg columns
      need room to grow.

   4. GLASS, NOT CARD. A translucent card with a 16px backdrop blur so the
      section's orbs show through; a solid background kills the effect.

   ── data-reveal AND transition-* CANNOT SHARE AN ELEMENT ──────────────────
   `[data-reveal]` in globals.css sets `transition` outside any cascade layer,
   and unlayered CSS beats Tailwind's layered utilities, so a `transition-*`
   class on the same element silently loses and hover styles snap. The reveal
   goes on a wrapper; the hover stays on the tile. */
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
  /** Spans two columns at lg and steps the title from 1.375rem to 1.75rem.
   *  Use only where the wide tiles still leave the grid's rows full. */
  wide?: boolean;
}) {
  const { ref, onPointerMove, onPointerLeave } = usePointerLight<HTMLElement>();

  return (
    /* Wrapper reveals, article hovers — see the note above. The column span
       lives here because the wrapper is the grid item. */
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

        <div /* shrink-0 is load-bearing: the tile is a flex column, so long
         copy would otherwise squash the plate below its 56px size. */
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
          {/* font-medium holds up against the glass ground where 400 goes
            muddy. --muted-strong pays for the unmasked wash; read 2 above
            before changing it. */}
          <p className="font-medium leading-[1.65] text-muted-strong">
            {item.body}
          </p>
        </div>
      </article>
    </div>
  );
}
