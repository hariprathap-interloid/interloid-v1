import Icon from "./Icon";
import SectionHeading from "./SectionHeading";
import TechLogo from "./service/TechLogo";
import { HUE, ROLES, TERMS } from "@/content/site";

/* ── HOVER: ONE RULE, FOUR SIGNATURES ─────────────────────────────────────
   THE RULE, everywhere on this page: hover changes COLOUR, ELEVATION and the
   state of CHILDREN. It never moves or resizes the hovered element. WorkCard.tsx
   documents why — a translate on the hovered element moves its own hit box out
   from under a pointer resting near the edge, `:hover` drops, it moves back, and
   it oscillates at frame rate. Padding, margin and size are the same trap.
   `box-shadow` and `ring` are safe because a shadow is not hit-tested, and so is
   anything on an absolutely-positioned child, whose size cannot alter its
   parent's bounds.

   (Tailwind v4 compiles `-translate-y-*`/`scale-*` to the standalone
   `translate`/`scale` properties, NOT to `transform` — so a
   `transition-[...,transform]` eases a property that never changes and the
   motion snaps. `.careers.mjs` reads all three.)

   THE SIGNATURE, different in each section, because four sections that all
   wipe a bar across the top is one effect repeated rather than a page with a
   rhythm. Each one lights up whatever that section is actually about:

     Roles       the card floods with the ROLE'S OWN hue and the tech marks
                 ring up — the thing a candidate is scanning the card for
     Programme   the numbered node IGNITES with a halo — the section is a
                 timeline, so the node is the thing that should respond
     HiringPath  the ghost STEP NUMBER brightens and its icon tile inverts —
                 "this step is the one you are reading"
     FitCheck    the icon tiles FILL IN SEQUENCE, staggered down the column,
                 so the list reads itself top to bottom

   All four keep the shared chrome (border warms, shadow-sm → shadow-lg) so the
   page still feels like one page. */

/* ==========================================================================
   OPEN ROLES — four trainee positions.

   ── REWRITTEN 2026-09-08, AND IT IS NOW A SERVER COMPONENT ───────────────
   The senior version was a client component: a discipline filter over six
   roles, plus a disclosure that opened the full job description in place.
   Both are gone, and both for the same reason — four roles do not need them.
   A filter over four items is a control that costs a click and saves nothing,
   and once the terms live in PROGRAMME there is no per-role description long
   enough to be worth hiding. Removing `useState` removed the whole client
   bundle for this section, and with it every one of the Reveal-vs-React
   `className` hazards the old banner had to warn about. Simpler page, less
   JavaScript, same information.

   ── THE STACK IS ICONS, NOT WORDS ────────────────────────────────────────
   On request. This renders `service/TechLogo`, which draws the real published
   marks out of `public/tech/` — the SAME component /services uses, so the two
   pages cannot drift into showing a technology two different ways.

   It replaced nine SVGs hand-authored here on 2026-09-08, which were deleted
   the moment the logo set turned out to already exist. Two of them were not
   the right mark at all (Postgres as a cylinder, Docker as stacked boxes), and
   the drawings had no chance of staying in step with /services. Reaching for
   the existing component was the whole fix.

   TechLogo carries the white plate, the accessible name and the tooltip, and
   its own file explains why the plate stays white in both themes.

   NO SALARY ON THE CARD. Every role here has identical terms, so they live in
   TERMS and are stated once, in PROGRAMME. Repeating them per card would be
   four places to correct instead of one — and these are the numbers most
   likely to change.

   ⚠ Whether these four are open is unverified; the grid is data-placeholder.
   ========================================================================== */
export default function Roles() {
  return (
    <section
      id="openings"
      className="relative overflow-hidden border-t border-border bg-background py-28"
    >
      <div
        className="pointer-events-none absolute left-0 top-1/3 size-[460px] -translate-x-1/3 rounded-full bg-accent/10 blur-[120px]"
        aria-hidden="true"
      />
      <div className="relative z-10 shell">
        <SectionHeading
          eyebrow="Open roles"
          icon="search"
          accent="one stack each."
          lead={`Four trainee positions, ${TERMS.mode.toLowerCase()} in ${TERMS.location}. You pick the stack you want to learn; the terms are the same for all four.`}
        >
          Four ways in,
        </SectionHeading>

        <ul
          className="grid gap-6 md:grid-cols-2"
          data-placeholder="P1: confirm these four roles are open before publishing"
        >
          {ROLES.map((r, i) => {
            const h = HUE[r.hue];
            return (
              <li
                key={r.id}
                data-reveal
                style={{ "--delay": `${i * 80}ms` } as React.CSSProperties}
                className="h-full"
              >
                <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border bg-card p-8 shadow-sm transition-[border-color,box-shadow] duration-300 ease-out hover:border-accent/40 hover:shadow-lg">
                  {/* SIGNATURE — the role's own hue floods the card. Bigger
                      and softer than a corner accent so it reads as the card
                      warming up rather than as a light in the corner, and it is
                      `h.glow`, so each of the four cards lights a different
                      colour. Absolutely positioned: its size cannot touch the
                      card's bounds. */}
                  <div
                    className={`pointer-events-none absolute -right-24 -top-24 size-64 rounded-full opacity-0 blur-[80px] transition-opacity duration-500 ease-out group-hover:opacity-100 ${h.glow}`}
                    aria-hidden="true"
                  />
                  <span
                    className={`relative mb-4 w-fit rounded-full px-2.5 py-[3px] text-[11px] font-bold uppercase tracking-[0.08em] ring-1 ${h.soft} ${h.ring} ${h.text}`}
                  >
                    {r.track}
                  </span>

                  <h3 className="relative mb-3 font-display text-xl font-bold leading-[1.35] tracking-[-0.02em] text-foreground">
                    {r.title}
                  </h3>
                  <p className="relative mb-6 text-[15px] leading-[1.7] text-muted-strong">
                    {r.summary}
                  </p>

                  <ul className="relative mb-6 space-y-2.5">
                    {r.look.map((l) => (
                      <li
                        key={l}
                        className="flex gap-2.5 text-[14px] leading-[1.6] text-muted-foreground"
                      >
                        <span className="mt-0.5 shrink-0 text-accent-strong">
                          <Icon name="check" className="size-4" />
                        </span>
                        {l}
                      </li>
                    ))}
                  </ul>

                  {/* mt-auto pins this row to the bottom of every card, so the
                      marks line up across a row whose summaries differ in
                      length. Without it the grid reads as ragged. */}
                  <div className="relative mt-auto flex items-center justify-between gap-4 border-t border-hairline pt-6">
                    <ul className="flex items-center gap-2">
                      {r.tech.map((t) => (
                        /* TechLogo IS the plate — it renders its own
                           `size-9 rounded-xl bg-white ring-1` wrapper, so this
                           <li> must not draw a second one around it. */
                        /* SIGNATURE, part two: the marks ring up in the
                           role's hue. `ring-0` at rest with the colour already
                           set, so only the WIDTH animates — and a ring is a
                           box-shadow, so nothing here is hit-tested or moves.
                           TechLogo draws its own plate; this ring sits outside
                           it, which is why the li is `rounded-xl` too. */
                        <li
                          key={t.name}
                          className={`flex rounded-xl ring-0 transition-[box-shadow] duration-300 ease-out group-hover:ring-2 ${h.ring}`}
                        >
                          <TechLogo tech={t} size="sm" />
                        </li>
                      ))}
                    </ul>
                    <a
                      href={`mailto:hello@interloid.com?subject=${encodeURIComponent(
                        `Application — ${r.title}`,
                      )}`}
                      /* No arrow slide. `group-hover:translate-x-1` is the
                         same hover-geometry rule one level down, and with the
                         cards' lift gone it was the only thing still moving on
                         the page. Background and shadow carry the state. */
                      className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-[background-color,box-shadow] duration-300 hover:bg-brand-light hover:shadow-primary/40 active:scale-95"
                    >
                      Apply
                      <Icon name="arrow" className="size-4" />
                    </a>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>

        {/* SENIOR HIRING, STATED RATHER THAN IMPLIED. The senior set is parked
            in site.ts as SENIOR_ROLES and rendered nowhere — this line is what
            replaces it. Saying "not right now" is worth more than silence: a
            senior reader who finds only trainee roles otherwise concludes we
            do not employ seniors, which contradicts every client page. */}
        <p
          data-reveal
          style={{ "--delay": "360ms" } as React.CSSProperties}
          className="mt-8 flex flex-wrap items-center gap-2 rounded-[1.25rem] border border-dashed border-border px-6 py-5 text-[15px] leading-[1.7] text-muted-foreground"
        >
          <span className="text-accent-strong">
            <Icon name="clock" className="size-4" />
          </span>
          Hiring experienced or senior engineers is closed at the moment. When
          it reopens it will be posted here first —{" "}
          <a
            href="mailto:hello@interloid.com?subject=Tell%20me%20when%20senior%20roles%20open"
            className="font-semibold text-primary underline underline-offset-4"
          >
            {/* The full stop lives INSIDE the anchor's line, not on its own.
                JSX turns a newline between `</a>` and `.` into a space, which
                renders as "tell you when ." — visible at any size. */}
            ask us to tell you when
          </a>
          {"."}
        </p>
      </div>
    </section>
  );
}
