import Icon from "../Icon";
import SectionHeading from "../SectionHeading";
import { PLACE } from "@/content/about";

/* "Where we are" — and which country that is.

   ── THIS SECTION EXISTS TO SETTLE A LIVE P1 ──────────────────────────────
   HANDOFF §7 carries a GEOGRAPHY CONTRADICTION as an open item: the live
   site's meta says "Based in US & UK" while the only address is Tamil Nadu
   and the only phone number is +91. Every prototype has used the honest
   framing instead ("India-based · US & UK overlap hours") and it has been
   waiting on the user's confirmation ever since.

   An About page is where that gets answered in the open or not at all, so
   the lead says it in one sentence — plenty of firms this size present as
   American and route the work elsewhere; we do not — and the overlap card
   carries the flag until the real window is confirmed.

   ── THREE CARDS, AND THE MIDDLE ONE IS THE ANSWER ────────────────────────
   Office / overlap / entity. The middle is the one a buyer actually worries
   about, and it is deliberately not first: leading with the timezone would
   read as an apology for the address. Address, then how it works, then who
   you are contracting with.

   `lines` renders as display type and `note` as body, so each card is a
   figure with an explanation rather than a paragraph with a heading — the
   same figure-over-label idea the /careers summary strip uses, which is what
   makes a three-up row scannable instead of read.

   Ground moved to `bg-background` when the roster was inserted above it —
   the alternation is hero(sec) → origin(bg) → shape(sec) → people(bg) →
   team(sec) → place(bg), and two `bg-secondary` sections in a row would read
   as one very long section.

   HOVER SIGNATURE — the card's ground warms to `bg-secondary` while its icon
   tile inverts. A ground change is the one colour move no other section on
   the site uses for its signature, and it suits three cards that are
   effectively an address block: the card lights up, nothing else happens.
   Nothing moves, per the site-wide rule in WorkCard.tsx. */
export default function Place() {
  return (
    <section
      id="place"
      className="relative overflow-hidden border-t border-border bg-background py-28"
    >
      <div
        className="pointer-events-none absolute left-1/4 top-0 size-[520px] -translate-y-1/3 rounded-full bg-brand/10 blur-[120px]"
        aria-hidden="true"
      />
      <div className="relative z-10 shell">
        <SectionHeading
          eyebrow={PLACE.eyebrow}
          icon="shield"
          accent={PLACE.accent}
          lead={PLACE.lead}
          className="mb-16 max-w-2xl"
        >
          {PLACE.head}
        </SectionHeading>

        <ul className="grid gap-6 md:grid-cols-3">
          {PLACE.cards.map((c, i) => (
            <li
              key={c.label}
              data-reveal
              style={{ "--delay": `${i * 90}ms` } as React.CSSProperties}
              className="h-full"
            >
              <div
                className="group flex h-full flex-col rounded-[1.5rem] border border-border bg-card p-8 shadow-sm transition-[background-color,border-color,box-shadow] duration-300 ease-out hover:border-accent/40 hover:bg-secondary hover:shadow-lg"
                {...(c.ph ? { "data-placeholder": c.ph } : {})}
              >
                <div className="mb-6 flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand ring-1 ring-brand/15 transition-[background-color,color] duration-300 ease-out group-hover:bg-brand group-hover:text-white">
                    <Icon name={c.k} className="size-5" />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                    {c.label}
                  </span>
                </div>

                {/* `<address>` is only correct for the first card — it is for
                    contact details, not for arbitrary content — so the tag is
                    chosen per card rather than applied to all three for the
                    sake of symmetry. */}
                {i === 0 ? (
                  <address className="mb-4 font-display text-xl font-bold not-italic leading-[1.35] tracking-[-0.02em] text-foreground">
                    {c.lines.map((l) => (
                      <span key={l} className="block">
                        {l}
                      </span>
                    ))}
                  </address>
                ) : (
                  <p className="mb-4 font-display text-xl font-bold leading-[1.35] tracking-[-0.02em] text-foreground">
                    {c.lines.map((l) => (
                      <span key={l} className="block">
                        {l}
                      </span>
                    ))}
                  </p>
                )}

                <p className="mt-auto border-t border-hairline pt-5 text-[14px] leading-[1.7] text-muted-foreground">
                  {c.note}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
