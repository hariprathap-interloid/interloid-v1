import type { Tech } from "@/content/service";

/* ==========================================================================
   TECH LOGOS — the real brand marks, from `public/tech/`.
   ==========================================================================
   The live site's #technologies section uses EMOJI as its category icons
   (💻 📱 ⚙️ ☁️ 🤖 👥). CLAUDE.md §3.6 bans that outright, and the review names
   it the most visible unpolish on the live site — so the categories here take
   Lucide glyphs from Icon.tsx and the technologies themselves take their own
   published marks.

   ── WHY A WHITE PLATE IN BOTH THEMES ─────────────────────────────────────
   Same reasoning as Roles.tsx's chips: these are fixed brand hexes, and
   several of them (Node's green, Express's black, GitHub's black) fall below
   readable contrast on the dark card. A mark that changes colour with the
   page theme is no longer the mark. A constant light plate keeps every logo
   looking like itself in either theme, and it is why the file list picks the
   `-dark` variant of the two-tone marks (`expressjs-dark`, `github-dark`) —
   dark ink on a light plate, always.

   ── WHEN THERE IS NO MARK ────────────────────────────────────────────────
   Nine of the ~50 technologies on this page have no icon in the set
   (FastAPI, Expo, Xcode, Prometheus, LangChain, LangGraph, Scikit-learn,
   pandas, Pinecone, Weaviate). They render a MONOGRAM plate instead. The
   alternative was to borrow a neighbouring product's mark — the set has
   `pandacss.svg`, which is a CSS library and not pandas — and shipping the
   wrong company's logo is worse than shipping letters.

   Plain <img>, not next/image: these are tiny static SVGs already in
   `public/`, so there is nothing for the optimiser to do, and next/image
   would add a wrapper and a layout shift for a 24px square.
   ========================================================================== */

/* Two letters, and the split has to understand camelCase: "LangChain" and
   "LangGraph" are single words, so taking the first two characters gave both
   of them "La" — two different products with the same chip, which is worse
   than no chip. Splitting on the internal capital gives LC and LG.
   Falls back to the first two letters for a genuinely single word (Expo → Ex,
   pandas → Pa). */
function monogram(name: string) {
  const parts = name
    .replace(/[^A-Za-z]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .split(/\s+/);
  const letters =
    parts.length > 1 ? parts[0][0] + parts[1][0] : name.replace(/[^A-Za-z]/g, "").slice(0, 2);
  return letters.toUpperCase();
}

export default function TechLogo({
  tech,
  size = "md",
  shape = "rounded",
}: {
  tech: Tech;
  /** `circle` matches the core and the service tiles, so a technology reads
      as the smallest node in the same family rather than as a chip stuck onto
      the diagram. The list compositions keep `rounded`, where a chip beside a
      name is exactly right. */
  shape?: "rounded" | "circle";
  /** Bumped a step across the board on 2026-09-08: at 32px plate / 16px mark
      the logos were not readable on the diagram, which is the one place they
      have to do the whole job of naming a technology. `lg` exists for the
      radial layouts, where a mark is the only thing standing in for a label. */
  size?: "sm" | "md" | "lg";
}) {
  const box =
    size === "sm" ? "size-9" : size === "lg" ? "size-12" : "size-10";
  const img =
    size === "sm" ? "size-5" : size === "lg" ? "size-7" : "size-6";

  /* bg-white in BOTH themes, and a ring rather than a border, for the reason
     in the banner: these are fixed brand hexes and several go unreadable on
     the dark card. The shadow is what lifts the node off a connector passing
     beneath it. */
  return (
    <span
      className={`grid ${box} shrink-0 place-items-center bg-white shadow-sm ring-1 ring-border ${
        shape === "circle" ? "rounded-full" : "rounded-xl"
      }`}
      /* The name is on the wrapper, so a monogram and a logo announce the
         same way and the decorative <img> stays out of the a11y tree. */
      role="img"
      aria-label={tech.name}
      title={tech.name}
    >
      {tech.file ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/tech/${tech.file}`}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className={`${img} object-contain`}
        />
      ) : (
        <span
          aria-hidden="true"
          className={`font-display font-bold tracking-tight text-slate-500 ${
            size === "lg" ? "text-[13px]" : "text-[11px]"
          }`}
        >
          {monogram(tech.name)}
        </span>
      )}
    </span>
  );
}
