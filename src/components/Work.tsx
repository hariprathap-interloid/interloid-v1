import Icon from "./Icon";
import SectionHeading from "./SectionHeading";
import WorkCard from "./WorkCard";
import { CASES, HUE } from "@/content/site";

/* Selected work cards. A Server Component: the card shell (WorkCard) is client
   for the cursor-lit border, and everything inside it is rendered here and
   passed through as children. Read WorkCard's note before changing the hover.

   The hover reads across three surfaces: the lit ring on the shell, the plate
   tint + icon shadow here, and the CTA colour. `group-*` works from here even
   though the `group` is on WorkCard's <article> — that is plain CSS, so these
   children stay server-rendered.

   Copy marked data-placeholder is unverified; confirm before public launch. */
export default function Work() {
  return (
    <section
      id="work"
      className="relative overflow-hidden border-t border-border bg-background pb-8 pt-32"
    >
      <div className="relative z-10 shell">
        <SectionHeading
          eyebrow="Selected work"
          accent="handed over."
          className="max-w-2xl"
        >
          Shipped, then
        </SectionHeading>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {CASES.map((c, i) => {
            const h = HUE[c.hue];
            return (
              <WorkCard key={c.title} index={i}>
                {/* The plate carries the hover's colour. It is the biggest
                    surface on the card and the only one with no text over it,
                    so a tint here costs no contrast — see WorkCard's note. */}
                <div
                  className={`relative mb-5 grid h-48 place-items-center overflow-hidden rounded-2xl transition-colors duration-300 ease-out ${h.soft} ${h.softHover}`}
                >
                  <div
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--border)_1.5px,transparent_1.5px)] bg-[size:20px_20px] opacity-40 transition-opacity duration-300 ease-out group-hover:opacity-70"
                    aria-hidden="true"
                  />
                  {/* No scale on the tile either — see WorkCard's note on the
                      hover-flicker loop. Elevation carries it instead. */}
                  <span
                    className={`relative grid size-16 place-items-center rounded-2xl bg-card shadow-md transition-shadow duration-300 ease-out group-hover:shadow-lg ${h.text}`}
                  >
                    <Icon name="layers" className="size-8" />
                  </span>
                </div>
                <div className="relative flex flex-1 flex-col px-4 pb-4">
                  <span
                    className={`mb-3 text-xs font-semibold uppercase tracking-wide ${h.text}`}
                  >
                    {c.sector}
                  </span>
                  <h3 className="mb-3 font-display text-xl font-bold text-foreground">
                    {c.title}
                  </h3>
                  <p className="mb-6 leading-relaxed text-muted-foreground">
                    {c.body}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-300 ease-out group-hover:text-foreground">
                    Placeholder
                    <span className="transition-transform group-hover:translate-x-1">
                      <Icon name="arrow" className="size-4" />
                    </span>
                  </span>
                </div>
              </WorkCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
