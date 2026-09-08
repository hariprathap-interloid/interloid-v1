import Icon from "../Icon";
import SectionHeading from "../SectionHeading";
import { HUE } from "@/content/site";
import { TEAM, TEAM_HEADING, TEAM_OPEN } from "@/content/about";

/* ==========================================================================
   THE TEAM — promoted from the /team lab, 2026-09-08. Lab now deleted.
   ==========================================================================
   Chosen by the user from ten candidates: the "Badge" card, with heading
   option "c". Anatomy, top to bottom, which is the order they asked for:

     1. PORTRAIT   4:5, filling the card's full width
     2. HUE SEAM   a 3px rule in the person's colour
     3. LINKEDIN   a circular badge straddling that seam
     4. NAME       display type, centred
     5. ROLE       under it, in the person's hue

   ── WHAT IT IS AND IS NOT ────────────────────────────────────────────────
   The anatomy is the reference site's (photo, badge on the seam, centred
   caption). Everything that makes it look like anything is ours: the hue
   system carries a colour per seat through the seam, the badge ring and the
   role; radius, border, shadow and type all come from the tokens. Their card
   is flat white with a grey badge and no colour at all.

   ── THE BADGE ANCHOR IS THE ONE FIDDLY BIT ──────────────────────────────
   The photo needs `overflow-hidden` for its rounded top, so a badge that
   overlaps the seam CANNOT live inside it. Anchoring it to the photo's height
   would couple it to the aspect ratio; instead the caption block carries
   `pt-8` and the badge hangs from the caption's TOP edge with
   `-translate-y-1/2`. Change the aspect ratio and nothing moves.

   ── THE THREE NULL FIELDS ARE STILL THE WHOLE CONTRACT ──────────────────
   `name`, `img`, `linkedin` in content/about.ts, independent:
     img       every seat currently has committed PLACEHOLDER art
               (`/team/ph-*.svg`) — abstract silhouettes, plainly not people.
               Swap in the real photograph and nothing else changes.
     name      null renders "Named in your proposal" — the promise the People
               section makes two sections above.
     linkedin  null renders the person's discipline glyph on the badge disc
               instead of a link. Never a dead anchor, and the seam keeps its
               rhythm either way.

   ⚠ PHOTOGRAPHS MUST BE OF THESE PEOPLE, WITH PERMISSION. Not stock, not
   scraped. `.about.mjs` enforces the only rule a harness can: until real
   photos land, every image here must be `ph-*.svg`, so adding a real-looking
   one is a deliberate act that has to update that check too.

   HOVER — colour and elevation only, nothing moves (WorkCard.tsx): the
   photo's wash clears, border warms, shadow grows. The hue seam is a FIXED
   height; an earlier version grew it and made the card 2px taller on hover,
   which the harness caught. */
export default function Team() {
  return (
    <section
      id="team"
      className="relative overflow-hidden border-t border-border bg-secondary py-28"
    >
      <div
        className="pointer-events-none absolute right-0 top-1/4 size-[520px] translate-x-1/3 rounded-full bg-brand/10 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 size-[420px] -translate-x-1/3 translate-y-1/4 rounded-full bg-accent/10 blur-[120px]"
        aria-hidden="true"
      />
      <div className="relative z-10 shell">
        <SectionHeading
          eyebrow={TEAM_HEADING.eyebrow}
          icon="users"
          accent={TEAM_HEADING.accent}
          lead={TEAM_HEADING.lead}
          className="mb-16 max-w-2xl"
        >
          {TEAM_HEADING.head}
        </SectionHeading>

        <ul
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          data-placeholder="P1: confirm which of these seats exist, and add real permissioned photographs"
        >
          {TEAM.map((m, i) => {
            const h = HUE[m.hue];
            return (
              <li
                key={m.role}
                data-reveal
                style={{ "--delay": `${i * 70}ms` } as React.CSSProperties}
                className="h-full"
              >
                <article className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-border bg-card shadow-sm transition-[border-color,box-shadow] duration-300 ease-out hover:border-accent/40 hover:shadow-lg">
                  {/* 1 — the portrait */}
                  <div className="relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/team/${m.img}`}
                      alt={m.name ?? m.role}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/5] w-full object-cover"
                    />
                    <div
                      className="absolute inset-0 bg-ink/10 transition-opacity duration-500 ease-out group-hover:opacity-0"
                      aria-hidden="true"
                    />
                  </div>

                  {/* 2 — the seam, in this person's hue. Fixed height. */}
                  <div className={`h-[3px] w-full ${h.tile}`} aria-hidden="true" />

                  <div className="relative flex flex-1 flex-col px-5 pb-6 pt-8 text-center">
                    {/* 3 — the badge, hung from the caption's top edge */}
                    <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                      {m.linkedin ? (
                        <a
                          href={m.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${m.name ?? m.role} on LinkedIn`}
                          className={`grid size-11 place-items-center rounded-full bg-card text-[#0A66C2] shadow-md ring-2 transition-[background-color,color] duration-300 hover:bg-[#0A66C2] hover:text-white ${h.ring}`}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-[18px]"
                            aria-hidden="true"
                          >
                            <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3zM10 9h3.8v1.7h.05a4.2 4.2 0 0 1 3.75-2c4 0 4.75 2.6 4.75 6V21h-4v-5.3c0-1.3 0-2.9-1.8-2.9s-2.05 1.4-2.05 2.8V21h-4z" />
                          </svg>
                        </a>
                      ) : (
                        /* No URL yet. The disc stays so the seam keeps its
                           rhythm, but it is not a link and does not look like
                           one — a disabled-looking button invites a click. */
                        <span
                          className={`grid size-11 place-items-center rounded-full bg-card text-muted-foreground shadow-md ring-2 ${h.ring}`}
                          aria-hidden="true"
                        >
                          <Icon name={m.k} className="size-5" />
                        </span>
                      )}
                    </span>

                    {/* 4 — name */}
                    {m.name ? (
                      <h3 className="font-display text-[17px] font-bold leading-[1.3] tracking-[-0.015em] text-foreground">
                        {m.name}
                      </h3>
                    ) : (
                      <h3 className="font-display text-[15px] font-semibold leading-[1.3] text-muted-foreground">
                        Named in your proposal
                      </h3>
                    )}
                    {/* 5 — role */}
                    <p className={`mt-1 text-[13px] font-semibold ${h.text}`}>
                      {m.role}
                    </p>
                  </div>
                </article>
              </li>
            );
          })}

          {/* The open seat — dashed and on the page ground, so it reads as a
              gap in the roster rather than an eighth colleague. Also the only
              route from /about to the hiring page. */}
          <li
            data-reveal
            style={{ "--delay": `${TEAM.length * 70}ms` } as React.CSSProperties}
            className="h-full"
          >
            <a
              href={TEAM_OPEN.href}
              className="group flex h-full flex-col items-center justify-center gap-4 rounded-[1.25rem] border border-dashed border-border bg-background p-6 text-center transition-[border-color,background-color] duration-300 ease-out hover:border-accent/50 hover:bg-card"
            >
              <span className="grid size-14 place-items-center rounded-full bg-muted text-muted-strong ring-1 ring-border transition-[background-color,color] duration-300 ease-out group-hover:bg-accent group-hover:text-white">
                <Icon name="users" className="size-7" />
              </span>
              <span>
                <span className="block font-display text-[17px] font-bold leading-[1.3] tracking-[-0.015em] text-foreground">
                  {TEAM_OPEN.title}
                </span>
                <span className="mt-2 block text-[14px] leading-[1.65] text-muted-strong">
                  {TEAM_OPEN.body}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary">
                {TEAM_OPEN.cta}
                <Icon name="arrow" className="size-3.5" />
              </span>
            </a>
          </li>
        </ul>

        {/* The line for the team — the only copy on this site addressed to the
            people who work here rather than to the market. */}
        <p
          data-reveal
          style={{ "--delay": `${(TEAM.length + 1) * 70}ms` } as React.CSSProperties}
          className="mx-auto mt-10 max-w-2xl text-center text-[15px] leading-[1.8] text-muted-foreground"
        >
          {TEAM_HEADING.note}
        </p>
      </div>
    </section>
  );
}
