import Icon from "../Icon";
import SectionHeading from "../SectionHeading";
import { PLACE } from "@/content/about";

/* "Where we are" — the office, the working-hours overlap, and the entity.

   Order is deliberate: address, then how the overlap works, then who you are
   contracting with. Leading with the timezone would read as an apology for
   the address. `lines` renders as display type and `note` as body, so each
   card scans as a figure with an explanation.

   Ground is `bg-background` to keep the section grounds alternating on
   /about; two `bg-secondary` sections in a row read as one.

   Hover: the card's ground warms and its icon tile inverts. Nothing moves:
   a hover translate shifts the hit box out from under the pointer and
   flickers. Copy marked data-placeholder is unverified; confirm before
   public launch. */
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

        <ul className="grid gap-6 lg:grid-cols-3">
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

                {/* `<address>` is for contact details, so only the first card
                    uses it. */}
                {i === 0 ? (
                  <address className="mb-4 font-display text-xl font-bold not-italic leading-[1.35] tracking-[-0.02em] text-foreground">
                    {c.lines.map((l) => (
                      <span key={l} className="block [overflow-wrap:anywhere]">
                        {l}
                      </span>
                    ))}
                  </address>
                ) : (
                  <p className="mb-4 font-display text-xl font-bold leading-[1.35] tracking-[-0.02em] text-foreground">
                    {c.lines.map((l) => (
                      <span key={l} className="block [overflow-wrap:anywhere]">
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
