import Icon from "../Icon";
import SectionHeading from "../SectionHeading";
import { HUE } from "@/content/site";
import { SHAPE } from "@/content/about";

/* "How the company is built" — five things this firm does not have. An
   absence is checkable on the first call in a way a stated value is not.

   ── FIVE CARDS ON A 12-COLUMN GRID ───────────────────────────────────────
   Five does not divide into two or three columns without a hole. At `lg`,
   three cards of 4 then two of 6 fill both rows exactly (4+4+4 / 6+6).
   Changing the count changes this arithmetic.

   Hover: the icon tile fills with its hue and the glyph turns white. Nothing
   moves: a hover translate shifts the hit box out from under the pointer and
   flickers. */
export default function Shape() {
  return (
    <section
      id="shape"
      className="relative overflow-hidden border-t border-border bg-secondary py-28"
    >
      <div
        className="pointer-events-none absolute left-0 top-0 size-[480px] -translate-x-1/3 -translate-y-1/4 rounded-full bg-accent/10 blur-[120px]"
        aria-hidden="true"
      />
      <div className="relative z-10 shell">
        <SectionHeading
          eyebrow="How we are built"
          icon="layers"
          accent="is the interesting part."
          lead="What a company does not have shapes your experience of it more than anything it puts on a values page, and unlike a value, an absence is something you can check on the first call."
        >
          What we do not have
        </SectionHeading>

        <ul className="grid gap-6 lg:grid-cols-12">
          {SHAPE.map((s, i) => {
            const h = HUE[s.hue];
            /* 4/4/4 then 6/6. Derived from the index rather than stored per
               item, so the arithmetic lives in one place. */
            const span = i < 3 ? "lg:col-span-4" : "lg:col-span-6";
            return (
              <li
                key={s.title}
                data-reveal
                style={{ "--delay": `${i * 80}ms` } as React.CSSProperties}
                className={`h-full ${span}`}
              >
                <div
                  className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border bg-card p-8 shadow-sm transition-[border-color,box-shadow] duration-300 ease-out hover:border-accent/40 hover:shadow-lg"
                  {...(s.ph ? { "data-placeholder": s.ph } : {})}
                >
                  {/* Whole class strings from HUE, including the hover. A
                      class built at runtime (e.g. by string replace) is
                      invisible to Tailwind's scanner and is silently never
                      generated. */}
                  <span
                    className={`mb-6 grid size-12 place-items-center rounded-2xl ring-1 transition-[background-color,color,box-shadow] duration-300 ease-out group-hover:text-white ${h.soft} ${h.ring} ${h.text} ${h.solidHover}`}
                  >
                    <Icon name={s.k} className="size-6" />
                  </span>
                  <h3 className="mb-3 font-display text-xl font-bold leading-[1.35] tracking-[-0.02em] text-foreground">
                    {s.title}
                  </h3>
                  <p className="text-[15px] leading-[1.7] text-muted-strong">
                    {s.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
