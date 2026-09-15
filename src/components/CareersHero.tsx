import Icon from "./Icon";
import { CAREER_FACTS, TERMS } from "@/content/site";

/* /careers hero. Same skeleton as the other sub-page heroes (bg-secondary,
   blurred orbs, badge → H1 → lead) so the pages read as one site.

   The hero discloses rather than sells: the four facts under it (location,
   who it is for, the training, the money) decide whether the rest of the
   page is worth reading. One primary action: see the roles.

   `data-placeholder` on the facts comes from site.ts. Copy marked
   data-placeholder is unverified; confirm before public launch. */
export default function CareersHero() {
  return (
    <section
      id="careers-top"
      /* ── HEIGHT ──────────────────────────────────────────────────────────
         Padding plus content alone is a fixed height that looks short on a
         large monitor. `lg:min-h-[88svh]` is a minimum, so it never shrinks
         the content on a laptop; only tall screens get more.

         `svh`, not `vh`: `vh` is the largest viewport height on mobile, so a
         `vh` hero sits partly under the browser's own chrome until scrolled.

         88 rather than 100, so the next section's top edge stays visible and
         tells the reader to scroll. */
      className="relative flex flex-col overflow-hidden bg-secondary pb-24 pt-40 lg:min-h-[88svh]"
    >
      {/* Radially masked so the grid fades before the section edge instead of
          tiling into a hard cut. `var(--border)`, not a literal, so the dots
          survive the dark theme (where the token is white at 10%). */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--border)_1.5px,transparent_1.5px)] bg-[size:26px_26px] [-webkit-mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,#000_10%,transparent_100%)] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,#000_10%,transparent_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-24 right-0 size-[520px] translate-x-1/4 rounded-full bg-brand/15 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 size-[400px] -translate-x-1/3 translate-y-1/3 rounded-full bg-accent/15 blur-[120px]"
        aria-hidden="true"
      />

      {/* `flex-1` + `justify-center` is what spends the extra height: the
          content block centres inside the padded box instead of the whole
          surplus falling below the fact band. */}
      <div className="relative z-10 shell flex flex-1 flex-col justify-center">
        <div className="max-w-3xl 2xl:max-w-4xl">
          <div
            data-reveal
            className="mb-6 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-card px-4 py-2 text-sm font-medium leading-[1.5] shadow-sm"
          >
            <span className="text-accent-strong">
              <Icon name="users" className="size-4" />
            </span>
            {/* "at Interloid" drops below `sm` so the badge stays one line. */}
            <span className="text-muted-foreground">
              Careers<span className="hidden sm:inline"> at Interloid</span>
            </span>
            <span
              className="ml-1 flex items-center gap-1.5 rounded-full bg-teal-600/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-teal-600"
              data-placeholder="P1: confirm roles are open before publishing"
            >
              <span
                className="size-1.5 rounded-full bg-teal-600"
                aria-hidden="true"
              />
              4 trainee roles
            </span>
          </div>

          <h1
            data-reveal
            style={{ "--delay": "100ms" } as React.CSSProperties}
            /* 2xl bumps to 64px, and the column widens with it (max-w-4xl
               above) so the headline still breaks over two lines. Raising the
               size alone would push it to three. */
            className="font-display text-4xl font-medium leading-[1.1] tracking-[-0.025em] text-foreground md:text-5xl lg:text-[3.5rem] 2xl:text-[4rem]"
          >
            Learn to build software{" "}
            <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
              on real projects.
            </span>
          </h1>

          <p
            data-reveal
            style={{ "--delay": "200ms" } as React.CSSProperties}
            className="mt-6 max-w-2xl text-lg leading-[1.5] text-muted-foreground 2xl:max-w-3xl 2xl:text-xl"
          >
            Four trainee roles for freshers, on site in {TERMS.location}. Six
            months of training, then real client work, and every term of it is
            on this page rather than in a conversation you have to get to first.
          </p>

          <div
            data-reveal
            style={{ "--delay": "300ms" } as React.CSSProperties}
            className="mt-10"
          >
            <a
              href="#openings"
              /* No arrow slide (see the hover rule in Roles.tsx), and the
                 transition names the two properties that change rather than
                 `all`. */
              className="inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full bg-primary px-6 text-[15px] font-semibold sm:h-14 sm:px-8 sm:text-[17px] text-primary-foreground shadow-lg shadow-primary/25 transition-[background-color,box-shadow] duration-300 hover:bg-brand-light hover:shadow-primary/40 active:scale-95"
            >
              See the four roles
              <Icon name="arrow" className="size-5" />
            </a>
          </div>
        </div>

        {/* ── THE TERMS BAND ────────────────────────────────────────────
            One panel divided into four cells rather than four cards: inside a
            shared object, a cell with more text does not leave the row ragged.

            Flex, not grid: `divide-x` keys off DOM order, so on a two-column
            grid it would draw a rule down the left of the third cell, which
            sits in column one. A 1-D flex that switches from column to row
            always puts the rule between neighbours. */}
        <div
          data-reveal
          style={{ "--delay": "380ms" } as React.CSSProperties}
          className="mt-14"
        >
          <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-[1.5rem] border border-border bg-card/80 shadow-sm backdrop-blur-sm md:flex-row md:divide-x md:divide-y-0">
            {CAREER_FACTS.map((f) => (
              <li
                key={f.label}
                className="flex flex-1 items-start gap-3 p-6"
                {...(f.ph ? { "data-placeholder": f.ph } : {})}
              >
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/15">
                  <Icon name={f.k} className="size-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[15px] font-bold leading-[1.4] tracking-[-0.015em] text-foreground">
                    {f.label}
                  </span>
                  <span className="mt-1 block text-[13px] leading-[1.6] text-muted-foreground">
                    {f.body}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
