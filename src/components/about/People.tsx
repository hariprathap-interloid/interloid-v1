import Icon from "../Icon";
import SectionHeading from "../SectionHeading";
import { PEOPLE } from "@/content/about";

/* "Who you work with" — answered with things that are true and checkable
   rather than invented people or stock portraits.

   Layout 7/5: the points are rows, not a 2×2 grid, because they are one
   argument read in order. The commitment card sits beside them as a
   distinct object.

   Hover is colour-only: each row's icon plate lights in the accent. Nothing
   moves under the cursor. */
export default function People() {
  return (
    <section
      id="people"
      className="relative overflow-hidden border-t border-border bg-background py-28"
    >
      <div
        className="pointer-events-none absolute bottom-0 right-0 size-[520px] translate-x-1/3 translate-y-1/4 rounded-full bg-accent/10 blur-[120px]"
        aria-hidden="true"
      />
      <div className="relative z-10 shell">
        <SectionHeading
          eyebrow={PEOPLE.eyebrow}
          icon="users"
          accent={PEOPLE.accent}
          lead={PEOPLE.lead}
          className="mb-16 max-w-2xl"
        >
          {PEOPLE.head}
        </SectionHeading>

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
          <ol className="flex flex-col lg:col-span-7">
            {PEOPLE.points.map((pt, i) => (
              <li
                key={pt.title}
                data-reveal
                style={{ "--delay": `${i * 90}ms` } as React.CSSProperties}
              >
                {/* The rule lives on the item, not as `divide-y` on the list:
                    divide utilities key off DOM order and would misplace a
                    rule if the list gained a header. */}
                <div className="group flex gap-5 border-b border-hairline py-6 transition-colors duration-300 last:border-0">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground ring-1 ring-border transition-[background-color,color,box-shadow] duration-300 ease-out group-hover:bg-accent group-hover:text-white group-hover:ring-accent/30">
                    <Icon name={pt.k} className="size-5" />
                  </span>
                  <div>
                    <h3 className="mb-1.5 font-display text-[17px] font-bold leading-[1.4] tracking-[-0.015em] text-foreground transition-colors duration-300 group-hover:text-primary">
                      {pt.title}
                    </h3>
                    <p className="text-[15px] leading-[1.7] text-muted-strong">
                      {pt.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div
            data-reveal
            style={{ "--delay": "160ms" } as React.CSSProperties}
            className="lg:col-span-5"
          >
            <div className="h-full rounded-[1.5rem] border border-border bg-card p-8 shadow-sm sm:p-10 flex flex-col justify-center">
              <span className="mb-6 grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand ring-1 ring-brand/15">
                <Icon name="users" className="size-6" />
              </span>
              <h3 className="mb-4 font-display text-xl font-bold leading-[1.35] tracking-[-0.02em] text-foreground">
                {PEOPLE.commitment.title}
              </h3>
              <p className="text-[15px] leading-[1.8] text-muted-foreground">
                {PEOPLE.commitment.body}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
