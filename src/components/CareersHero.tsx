import Icon from "./Icon";
import { CAREER_FACTS, TERMS } from "@/content/site";

/* /careers hero.

   Same skeleton as /why-choose-us' — bg-secondary, blurred orbs, badge → H1 →
   lead — so the sub-pages read as one site.

   ── REWRITTEN 2026-09-08 ─────────────────────────────────────────────────
   The senior version sold autonomy to people who already have options. These
   roles are the opposite offer: no experience required, and a real cost in
   hours and years. So the hero stops selling and starts disclosing — the four
   facts under it are location, who it is for, the training, and the money,
   which are the four things that decide whether the rest of the page is worth
   anybody's time.

   ONE BUTTON NOW, not two. The senior version had a second ("how the hiring
   works") because a senior engineer often wants the process before the roles.
   A fresher wants the roles. DS §9 allows one primary per view and this page
   has one thing to do.

   `data-placeholder` on two of the four facts comes from site.ts, not from
   here — the hours and the money are the unconfirmed ones. */
export default function CareersHero() {
  return (
    <section
      id="careers-top"
      /* ── HEIGHT ON A LARGE MONITOR (2026-09-08) ─────────────────────────
         The hero was a FIXED 816px at every viewport, because nothing in it
         was viewport-relative — it is padding plus content, and both are
         constant. Measured: that fills 91% of a 1440×900 laptop, which is
         right, but only 57% of a 2560×1440 monitor, where the next section's
         heading pushes into the first screen. The user reported it from a
         24-inch display and the number matches the complaint exactly.

         `lg:min-h-[88svh]` and nothing below `lg:`. It is a MINIMUM, so it
         cannot shrink anything: at 900px tall it computes to 792px, under the
         816px the content already needs, and the laptop case is untouched.
         Only screens taller than ~928px get more.

         `svh`, not `vh`: `vh` is the LARGEST viewport height on mobile, so a
         `100vh`-family hero sits partly under the browser's own chrome until
         the user scrolls. Academic at `lg:` but wrong to write down twice.

         88 rather than 100 on purpose. A hero that exactly fills the screen
         hides the fact that there is anything below it; leaving the next
         section's top edge visible is what tells a reader to scroll. */
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
          surplus falling below the fact band. At laptop size there is no
          surplus and this changes nothing. */}
      <div className="relative z-10 shell flex flex-1 flex-col justify-center">
        <div className="max-w-3xl 2xl:max-w-4xl">
          <div
            data-reveal
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium leading-[1.5] shadow-sm"
          >
            <span className="text-accent-strong">
              <Icon name="users" className="size-4" />
            </span>
            <span className="text-muted-foreground">Careers at Interloid</span>
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
               above) so the headline still breaks over TWO lines. Raising the
               size alone would have pushed it to three — CLAUDE.md §5 records
               that exact regression on the home hero. */
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
            months of training, then real client work — and every term of it is
            on this page rather than in a conversation you have to get to first.
          </p>

          <div
            data-reveal
            style={{ "--delay": "300ms" } as React.CSSProperties}
            className="mt-10"
          >
            <a
              href="#openings"
              /* No arrow slide, and no `transition-all`. See Roles.tsx's
                 hover banner: nothing on this page moves on hover, because a
                 hover-triggered translate on the hovered element flickers at
                 its own edge — and naming the two properties that actually
                 change is self-documenting where `all` never is. */
              className="inline-flex h-14 items-center gap-2 rounded-full bg-primary px-8 text-[17px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-[background-color,box-shadow] duration-300 hover:bg-brand-light hover:shadow-primary/40 active:scale-95"
            >
              See the four roles
              <Icon name="arrow" className="size-5" />
            </a>
          </div>
        </div>

        {/* ── THE TERMS BAND (refactored 2026-09-08) ────────────────────
            Was four separate cards in a `sm:grid-cols-2 lg:grid-cols-4`. Three
            of the four bodies are one line and the fourth ("Fixed for year one
            · 2 years agreement") is two, so the row rendered visibly ragged —
            one card taller than its neighbours with a gap under the other
            three. `h-full` would have equalised the boxes and just moved the
            empty space inside them.

            It is now ONE panel divided into four cells, which removes the
            problem rather than hiding it: inside a shared object a cell with
            more text is a cell with more text, not a card that failed to line
            up. It also gives the page's most important content — the four
            facts a candidate decides on — a single confident shape instead of
            four floating chips.

            FLEX, NOT GRID, and that is load-bearing. `divide-x` keys off DOM
            order, so on a two-column grid it would draw a rule down the left
            of the third cell — which sits in column ONE. A 1-D flex that
            switches from column to row has no such case: the rule is always
            between neighbours. */}
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
