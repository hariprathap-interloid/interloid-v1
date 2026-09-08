import CommitmentTile from "./CommitmentTile";
import SectionHeading from "./SectionHeading";
import { BENTO } from "@/content/site";

/* DS §8.2 glass bento on the tinted surface, rebuilt to prototype 1's `.tile`.

   A SERVER component: the cursor spotlight lives in CommitmentTile, which is
   the only part that needs the client. Everything here is static markup and
   ships as HTML.

   Rebuilt 2026-09-07 to prototype 1's full seven-commitment set. The wide
   tiles are FIRST and LAST — see the count note in content/site.ts for why
   that is the only arrangement that fills three rows. `wide` is derived from
   the array length rather than hard-coded, so a 5-tile set falls back to
   prototype 1's original single wide tile without an edit here.

   THE ROW HEIGHT IS A MIN, NOT A TRACK — changed 2026-09-07, and it is a bug
   fix. `lg:auto-rows-[18rem]` defined a fixed grid TRACK, and a track cannot
   grow: between the lg breakpoint and ~1280px the three columns are narrow
   enough that the copy wraps past 18rem, and the tile (overflow-hidden) cut
   it. Measured on the running build: 5 of 7 tiles clipped at 1024px, up to
   50px; 1 tile at 1180px; clean from 1280px up. Every screenshot in this
   project had been taken at 1440, which is why it survived.

   The fix is `min-h-[18rem]` on the TILE (see CommitmentTile) with auto rows
   here: prototype 1's 18rem proportion is kept as a floor, and copy that needs
   more room gets it. Verified clean at 1024/1180/1280/1440/1600 in
   why-interloid-lab.html, layout G. Do not put a fixed height back. */
export default function Advantage() {
  const last = BENTO.length - 1;

  return (
    <section
      id="advantage"
      className="relative overflow-hidden bg-secondary py-32"
    >
      <div
        className="pointer-events-none absolute bottom-0 left-0 size-[600px] -translate-x-1/3 translate-y-1/3 rounded-full bg-brand/15 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 top-1/4 size-[420px] translate-x-1/3 rounded-full bg-accent/15 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative z-10 shell">
        <SectionHeading
          eyebrow="Why Interloid"
          icon="star"
          accent="put in writing."
          lead="We commit to these in the contract, not just on the website."
        >
          Commitments we
        </SectionHeading>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {BENTO.map((b, i) => (
            <CommitmentTile
              key={b.title}
              item={b}
              index={i}
              /* 7 tiles: wide at both ends = 9 slots = three full rows.
                 5 tiles: only the first is wide, prototype 1's arrangement. */
              wide={i === 0 || (BENTO.length % 3 === 1 && i === last)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
