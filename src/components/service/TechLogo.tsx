import type { Tech } from "@/content/service";

/* ==========================================================================
   TECH LOGOS — brand marks from `public/tech/` on a theme-adaptive plate.
   ==========================================================================
   The plate is `--logo-plate`: white in light, slate in dark — a step above
   --card, so it lifts off the ground it sits on.

   Brand colours are not recoloured, except marks drawn in near-black ink that
   would vanish on a dark plate. Those are listed in INK_MARKS and get a
   `.dark`-only filter from globals.css: `logo-mono` flattens a single-colour
   mark to white; `logo-invert` swaps black and white on a mark made of only
   those two. A multi-colour mark is never filtered (it would shift the brand
   hues); if it has dark ink it swaps to the brand's on-dark file via ON_DARK.

   A Tech without a `file` renders a monogram plate. Never substitute a
   similarly named product's mark — the wrong logo is worse than letters.

   Plain <img>, not next/image: tiny static SVGs gain nothing from the
   optimiser, and next/image would add a wrapper for a 24px square.
   ========================================================================== */

/* Two letters, splitting on camelCase so "LangChain" and "LangGraph" become
   LC and LG rather than both "La". A single word falls back to its first two
   letters (Expo → Ex). */
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

/* Marks whose ink is near-black and would disappear on the dark plate,
   judged from the SVGs' own fills. Add a file here only after checking that
   it is single-colour (`logo-mono`) or strictly black-and-white
   (`logo-invert`); see the banner for why nothing else is filtered. */
const INK_MARKS: Record<string, "logo-mono" | "logo-invert"> = {
  "expressjs-dark.svg": "logo-mono",
  "github-dark.svg": "logo-mono",
  "circleci.svg": "logo-mono",
  "openai.svg": "logo-mono",
  /* Single dark teal fill; white is MySQL's own on-dark treatment. */
  "mysql.svg": "logo-mono",
  "nextjs.svg": "logo-invert",
  /* Single near-black fill each. */
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
  /** `circle` matches round diagram nodes; `rounded` suits a chip beside a
      name in a list. */
  shape?: "rounded" | "circle";
  /** Plate size. `lg` is for diagrams where the mark stands in for a label. */
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
