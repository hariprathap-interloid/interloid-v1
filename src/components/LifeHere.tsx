import GalleryRail from "./GalleryRail";
import Icon from "./Icon";
import SectionHeading from "./SectionHeading";
import { HUE, LIFE } from "@/content/site";

/* ==========================================================================
   LIFE HERE — the bento, this site's answer to "Life at Converse".
   ==========================================================================
   Requested 2026-09-08. The reference block is four photographs of an office
   captioned "A collaborative, fast-paced, and incredibly rewarding
   environment". Two things are different here and both are the point.

   ── 1. NO PHOTOGRAPHS YET, AND NO EMPTY FRAMES EITHER ────────────────────
   Every tile has an `img` field in site.ts and every one is `null`. A tile
   with no image renders a DESIGNED panel — a hue wash, a dot texture, an
   oversized glyph watermark, and the caption block — rather than a grey box
   waiting for a photo. An empty frame advertises the absence; a designed panel
   does not read as missing anything.

   Drop a file into `public/life/`, set `img` to its filename, and the SAME
   tile renders the photograph with the caption over a scrim. One field, no
   component change. That is the same switch the /about roster uses for names,
   and it is why this could be built now rather than waited on.

   Stock photography is not an option at any point. An office full of people
   who do not work here is the same fabrication as an invented colleague, and
   worse on this page than on any other: the audience is the people who would
   be in that room, and they see the real one on their first day.

   ── 2. THE COPY IS CHECKABLE ─────────────────────────────────────────────
   Three adjectives nobody can verify is the thing this page argues against on
   every other section. Each tile says something specific instead — where
   people sit, what happens on a Friday, what the hours are — including the one
   most companies would leave out.

   ── THE BENTO ARITHMETIC IS LOAD-BEARING ─────────────────────────────────
   `lg:grid-cols-4` with `auto-rows-[minmax(210px,auto)]`, and the four spans
   in site.ts fill exactly two rows with no hole:

       [ A  2x2 .......... ][ B  2x1 .......... ]
       [ A  (continues) ...][ C 1x1 ][ D 1x1 ]

   Change the count or any `span` and the grid grows a gap — there is no
   auto-flow that repairs it. `auto-rows-[minmax(...)]` rather than a fixed
   height so a tile whose copy runs long grows instead of clipping; the tall
   tile then simply spans two of whatever that row height became.

   HOVER SIGNATURE — the watermark surfaces. The glyph sits at 6% and rises to
   14% while the wash deepens: the tile brightens from within rather than
   gaining a border effect, which is the closest non-photographic equivalent of
   an image lifting on hover. Nothing moves — the site-wide rule from
   WorkCard.tsx.

   The section also carries the MOMENTS RAIL (GalleryRail) below the bento —
   requested separately on 2026-09-08. Same subject, second half: the bento is
   the facts, the rail is the photographs. Keeping them in one section is what
   stops the page spending another band change on the same topic.

   ⚠ All four descriptions are unverified; the grid is data-placeholder. */
export default function LifeHere() {
  return (
    <section
      id="life"
      className="relative overflow-hidden border-t border-border bg-secondary py-28"
    >
      <div
        className="pointer-events-none absolute right-0 top-0 size-[520px] translate-x-1/3 -translate-y-1/4 rounded-full bg-brand/10 blur-[120px]"
        aria-hidden="true"
      />
      <div className="relative z-10 shell">
        <SectionHeading
          eyebrow="Life here"
          icon="users"
          accent="not three adjectives."
          lead="Every careers page says collaborative and fast-paced. Here is what is actually true about the room, including the part most companies leave out."
          className="mb-16 max-w-2xl"
        >
          What it is like,
        </SectionHeading>

        <ul
          className="grid gap-5 auto-rows-[minmax(210px,auto)] sm:grid-cols-2 lg:grid-cols-4"
          data-placeholder="P1: confirm each of these four descriptions, and add real photographs"
        >
          {LIFE.map((t, i) => {
            const h = HUE[t.hue];
            return (
              <li
                key={t.tag}
                data-reveal
                style={{ "--delay": `${i * 90}ms` } as React.CSSProperties}
                className={`h-full ${t.span}`}
              >
                <article className="group relative flex h-full flex-col justify-end overflow-hidden rounded-[1.5rem] border border-border bg-card p-7 shadow-sm transition-[border-color,box-shadow] duration-300 ease-out hover:border-accent/40 hover:shadow-lg">
                  {/* THE GROUND. With a photograph this is the image plus a
                      scrim; without one it is the hue wash. Both sit at the
                      same z-index under the same caption block, which is what
                      makes the swap a one-field change. */}
                  {t.img ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/life/${t.img}`}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 size-full object-cover"
                      />
                      {/* The scrim is what keeps the caption readable over an
                          unknown photograph. Bottom-weighted, because that is
                          where the text is. */}
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent"
                        aria-hidden="true"
                      />
                    </>
                  ) : (
                    <>
                      <div
                        className={`pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-500 ease-out group-hover:opacity-100 ${h.soft}`}
                        aria-hidden="true"
                      />
                      {/* Dot texture, radially masked so it fades before the
                          tile edge instead of tiling into a hard cut — DS
                          §2.6. `var(--border)`, not a literal, so it survives
                          the dark theme where the token is white at 10%. */}
                      <div
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--border)_1.5px,transparent_1.5px)] bg-[size:22px_22px] [-webkit-mask-image:radial-gradient(ellipse_80%_70%_at_70%_20%,#000_10%,transparent_100%)] [mask-image:radial-gradient(ellipse_80%_70%_at_70%_20%,#000_10%,transparent_100%)]"
                        aria-hidden="true"
                      />
                      {/* The watermark, and the hover signature. It BLEEDS off
                          the top-right corner deliberately — the card is
                          `overflow-hidden` to round its corners, so the glyph
                          is cropped there and reads as texture rather than as
                          an icon sitting in the tile.

                          That is the opposite call from the /careers step
                          numerals, which had to be pulled fully inside because
                          a half-sliced NUMERAL reads as broken. A numeral has
                          a right answer to "is it whole"; an abstract mark at
                          6% opacity does not, so cropping it is free. If this
                          ever becomes a glyph with a readable shape, move it
                          inside the padding like those numerals. */}
                      <span
                        className={`pointer-events-none absolute -right-4 -top-6 opacity-[0.06] transition-opacity duration-500 ease-out group-hover:opacity-[0.14] ${h.text}`}
                        aria-hidden="true"
                      >
                        <Icon name={t.k} className="size-40" />
                      </span>
                    </>
                  )}

                  {/* THE CAPTION. Identical in both states; only its colours
                      change, because over a photograph it sits on a dark scrim
                      and over the wash it sits on the card. */}
                  <div className="relative">
                    <span
                      className={`mb-3 inline-flex w-fit rounded-full px-2.5 py-[3px] text-[11px] font-bold uppercase tracking-[0.08em] ring-1 ${
                        t.img
                          ? "bg-white/12 text-white ring-white/25 backdrop-blur-sm"
                          : `${h.soft} ${h.ring} ${h.text}`
                      }`}
                    >
                      {t.tag}
                    </span>
                    <h3
                      className={`mb-2 font-display text-xl font-bold leading-[1.3] tracking-[-0.02em] ${
                        t.img ? "text-white" : "text-foreground"
                      }`}
                    >
                      {t.title}
                    </h3>
                    <p
                      className={`text-[15px] leading-[1.7] ${
                        t.img ? "text-white/85" : "text-muted-strong"
                      }`}
                    >
                      {t.body}
                    </p>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>

        {/* The moments rail — requested 2026-09-08, and it lives INSIDE this
            section rather than beside it: the bento is the facts half of "what
            it is like", the rail is the same subject in photographs, and a
            second <section> would have split one story across a band change.

            It is the only client component on /careers. GalleryRail's banner
            explains why arrows earn their JavaScript on a rail whose scrollbar
            is hidden. */}
        <GalleryRail />

        {/* Said once, quietly, under both. A reader who notices there are
            no photographs should find the reason here rather than assume the
            page is unfinished — the same move /about makes about the team. */}
        <p
          data-reveal
          style={{ "--delay": "400ms" } as React.CSSProperties}
          className="mt-6 flex items-start gap-2.5 text-[13px] leading-[1.7] text-muted-foreground"
          data-placeholder="P1: DELETE this line once real photographs are in public/life/"
        >
          <span className="mt-0.5 shrink-0 text-accent-strong">
            <Icon name="image" className="size-4" />
          </span>
          The tiles above and the frames beside them are waiting on real
          photographs of this office. We would rather show you nothing than a
          stock photo of somebody else&rsquo;s team — you will see the real room
          on your first day either way.
        </p>
      </div>
    </section>
  );
}
