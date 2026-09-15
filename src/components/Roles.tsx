import Icon from "./Icon";
import SectionHeading from "./SectionHeading";
import TechLogo from "./service/TechLogo";
import { HUE, ROLES, TERMS } from "@/content/site";

/* ── HOVER: ONE RULE, FOUR SIGNATURES ─────────────────────────────────────
   The rule, everywhere on /careers: hover changes colour, elevation and the
   state of children. It never moves or resizes the hovered element — a
   translate moves its own hit box out from under a pointer resting near the
   edge, `:hover` drops, it moves back, and it oscillates at frame rate.
   Padding, margin and size are the same trap. `box-shadow` and `ring` are
   safe because a shadow is not hit-tested, and so is anything on an
   absolutely-positioned child, whose size cannot alter its parent's bounds.

   (Tailwind v4 compiles `-translate-y-*`/`scale-*` to the standalone
   `translate`/`scale` properties, not to `transform`, so a
   `transition-[...,transform]` eases a property that never changes.)

   The signature differs per section so the page has a rhythm. Each lights
   up whatever that section is about:

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
   OPEN ROLES — four trainee positions. A server component: four roles need
   no filter or disclosure, so there is no client state.

   The stack renders through `service/TechLogo`, the same component /services
   uses, so a technology is never shown two different ways. TechLogo carries
   the plate, the accessible name and the tooltip.

   No salary on the card: every role has identical terms, stated once in
   PROGRAMME from TERMS, so there is one place to correct them.

   Copy marked data-placeholder is unverified; confirm before public launch.
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
                <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border bg-card p-6 shadow-sm sm:p-8 transition-[border-color,box-shadow] duration-300 ease-out hover:border-accent/40 hover:shadow-lg">
                  {/* Signature: the role's own hue (`h.glow`) floods the
                      card. Absolutely positioned, so its size cannot touch
                      the card's bounds. */}
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
                          <Icon name="check-circle" className="size-4" />
                        </span>
                        {l}
                      </li>
                    ))}
                  </ul>

                  {/* mt-auto pins this row to the bottom of every card, so the
                      marks line up across cards whose summaries differ in
                      length. flex-wrap lets Apply drop to its own line on
                      narrow phones instead of overflowing the card. */}
                  <div className="relative mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-6">
                    <ul className="flex items-center gap-2">
                      {r.tech.map((t) => (
                        /* TechLogo renders its own plate, so this <li> only
                           adds the hover ring in the role's hue. `ring-0` at
                           rest with the colour already set, so only the width
                           animates; a ring is a box-shadow, so nothing moves.
                           `rounded-xl` matches the plate. */
                        <li
                          key={t.name}
                          className={`flex rounded-xl ring-0 transition-[box-shadow] duration-300 ease-out group-hover:ring-2 ${h.ring}`}
                        >
                          <TechLogo tech={t} size="sm" />
                        </li>
                      ))}
                    </ul>
                    <a
                      /* The application page, with this role preselected. */
                      href={`/careers/apply?role=${r.id}`}
                      /* No arrow slide: per the hover rule, background and
                         shadow carry the state. */
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

        {/* Senior hiring, stated rather than implied: without this line a
            senior reader who finds only trainee roles would conclude we do
            not employ seniors. */}
        <p
          data-reveal
          style={{ "--delay": "360ms" } as React.CSSProperties}
          className="mt-8 flex items-start gap-3 rounded-[1.25rem] border border-dashed border-border px-6 py-5 text-[15px] leading-[1.7] text-muted-foreground"
        >
          <span className="mt-1.25 shrink-0 text-accent-strong">
            <Icon name="clock" className="size-4" />
          </span>
          {/* One flex item for the whole sentence: as loose flex children,
              the link and its full stop would be split by the row's gap. */}
          <span>
            Hiring experienced or senior engineers is closed at the moment.
            When it reopens it will be posted here first;{" "}
            <a
              href="mailto:connect@interloid.com?subject=Tell%20me%20when%20senior%20roles%20open"
              className="font-semibold text-primary underline underline-offset-4"
            >
              ask us to tell you when
            </a>
            .
          </span>
        </p>
      </div>
    </section>
  );
}
