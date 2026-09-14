import type { Tech } from "@/content/service";

/* ==========================================================================
   TECH LOGOS — the real brand marks, from `public/tech/`.
   ==========================================================================
   The live site's #technologies section uses EMOJI as its category icons
   (💻 📱 ⚙️ ☁️ 🤖 👥). CLAUDE.md §3.6 bans that outright, and the review names
   it the most visible unpolish on the live site — so the categories here take
   Lucide glyphs from Icon.tsx and the technologies themselves take their own
   published marks.

   ── THEME-ADAPTIVE PLATE (changed 2026-09-14, on request) ────────────────
   This was a white plate in BOTH themes, on the argument that a mark which
   changes colour with the theme is no longer the mark. In dark that put a
   field of bright white squares on the /services diagram, and the user asked
   for the plates to follow the theme. The plate is now `--logo-plate`:
   white in light, slate in dark — a step above --card, so a plate still
   lifts off the ground it sits on.

   Brand colours are NOT recoloured, with one exception: marks drawn in
   near-black ink, which would vanish on a dark plate. Those are listed in
   INK_MARKS and get a `.dark`-only filter from globals.css. `logo-mono`
   flattens a single-colour mark to white (the published on-dark treatment
   for Express, GitHub, OpenAI, CircleCI); `logo-invert` swaps black and
   white on a mark made of only those two (Next.js's disc and N). A
   multi-colour mark is never filtered — inverting it would shift its brand
   hues, which really would no longer be the mark. When one of those has
   dark ink (AWS's wordmark), it swaps to the brand's on-dark FILE via
   ON_DARK instead.

   Checked branch by branch on the dark diagram, 2026-09-14. Rails (#c00),
   Java and Flutter read dimmer than on white but still as themselves, and
   are deliberately left alone.

   ── WHEN THERE IS NO MARK ────────────────────────────────────────────────
   Every technology on this page has a mark as of 2026-09-14 (the last ten —
   FastAPI, Expo, Xcode, Prometheus, LangChain, LangGraph, Scikit-learn,
   pandas, Pinecone, Weaviate — were supplied by hand). A Tech without a
   `file` still renders a MONOGRAM plate. Never borrow a neighbouring
   product's mark instead — `pandacss.svg` is a CSS library, not pandas — and
   shipping the wrong company's logo is worse than shipping letters.

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

/* Marks whose ink is near-black and would disappear on the dark plate.
   Measured from the SVGs' own fills, not guessed from the brand: express
   has no fill at all (default black), github #161614, circleci #000, openai
   #193718, nextjs #000 + #fff only. Add a file here only after checking that
   it is single-colour (`logo-mono`) or strictly black-and-white
   (`logo-invert`); see the banner for why nothing else is filtered. */
const INK_MARKS: Record<string, "logo-mono" | "logo-invert"> = {
  "expressjs-dark.svg": "logo-mono",
  "github-dark.svg": "logo-mono",
  "circleci.svg": "logo-mono",
  "openai.svg": "logo-mono",
  /* #00546b only. Measured on the dark diagram: the dolphin all but
     vanished. White is MySQL's own on-dark treatment. */
  "mysql.svg": "logo-mono",
  "nextjs.svg": "logo-invert",
  /* Added 2026-09-14 with the manual set: Expo's official mark is #000
     only, Pinecone's #201d1e only. */
  "expo.svg": "logo-mono",
  "pinecone.svg": "logo-mono",
};

/* Multi-colour marks with dark ink cannot be filtered (see the banner), so
   they swap to the brand's published on-dark FILE instead. Both <img>s
   render; globals.css shows exactly one per theme (`logo-light-src` /
   `logo-dark-src`). aws-on-dark.svg is aws.svg with the #252f3e wordmark set
   to white and the orange smile untouched — AWS's own dark-background logo. */
const ON_DARK: Record<string, string> = {
  "aws.svg": "aws-on-dark.svg",
  /* pandas' #130754 bars set to white, yellow and pink untouched — pandas'
     own dark-background logo. scikit-learn's #010101 "scikit" lettering set
     to white, the orange and blue untouched. */
  "pandas.svg": "pandas-on-dark.svg",
  "scikit-learn.svg": "scikit-learn-on-dark.svg",
};

function MarkImg({ file, className }: { file: string; className: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/tech/${file}`}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
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

  /* The themed plate from the banner, and a ring rather than a border. The
     shadow is what lifts the node off a connector passing beneath it. */
  return (
    <span
      className={`grid ${box} shrink-0 place-items-center bg-logo-plate shadow-sm ring-1 ring-border ${
        shape === "circle" ? "rounded-full" : "rounded-xl"
      }`}
      /* The name is on the wrapper, so a monogram and a logo announce the
         same way and the decorative <img> stays out of the a11y tree. */
      role="img"
      aria-label={tech.name}
      title={tech.name}
    >
      {tech.file ? (
        ON_DARK[tech.file] ? (
          <>
            <MarkImg
              file={tech.file}
              className={`${img} object-contain logo-light-src`}
            />
            <MarkImg
              file={ON_DARK[tech.file]}
              className={`${img} object-contain logo-dark-src`}
            />
          </>
        ) : (
          <MarkImg
            file={tech.file}
            className={`${img} object-contain ${INK_MARKS[tech.file] ?? ""}`}
          />
        )
      ) : (
        <span
          aria-hidden="true"
          className={`font-display font-bold tracking-tight text-muted-foreground ${
            size === "lg" ? "text-[13px]" : "text-[11px]"
          }`}
        >
          {monogram(tech.name)}
        </span>
      )}
    </span>
  );
}
