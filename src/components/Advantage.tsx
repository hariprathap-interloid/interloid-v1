import CommitmentTile from "./CommitmentTile";
import SectionHeading from "./SectionHeading";
import { BENTO } from "@/content/site";

/* Glass bento on the tinted surface. A Server Component: only the cursor
   spotlight in CommitmentTile needs the client.

   `wide` is derived from the tile count rather than hard-coded, so the wide
   tiles always complete the last row.

   Rows are auto-sized; the 18rem height is a min-height on the tile, never a
   fixed grid track. A track cannot grow, and between lg and ~1280px the
   narrow columns wrap copy past 18rem, which the overflow-hidden tile clips. */
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
                 5 tiles: only the first is wide = 6 slots = two rows. */
              wide={i === 0 || (BENTO.length % 3 === 1 && i === last)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
