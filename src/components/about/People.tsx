import Icon from "../Icon";
import SectionHeading from "../SectionHeading";
import { PEOPLE } from "@/content/about";

/* "Who you work with" — the section that stands where a team page would.

   ── THIS IS THE ONE THAT MATTERS ─────────────────────────────────────────
   The reference page (conversedatasolutions.com/about) answers "who will I
   work with?" with sixteen named colleagues and photographs, in a carousel.
   It is the centre of gravity of their page and it is the single thing this
   site cannot answer in kind: HANDOFF §7 P1 is explicit — do not launch with
   invented people. Sixteen stock portraits with invented names would be the
   exact failure the review names, and worse than a fabricated testimonial,
   because a person is far easier to check than a quote.

   So the question gets answered with the four things that ARE true and
   checkable — named in the proposal, the same people throughout, in the room
   every Friday, reachable directly — and then the gap is stated out loud
   rather than left as a silence a reader fills in for themselves.

   ── LAYOUT: 7/5, THE ANSWERS AND THE ADMISSION ───────────────────────────
   The four points are rows, not a 2×2 grid: they are a single argument read
   in order, and a grid would invite the eye to sample them. The admission
   sits beside them as a distinct object — dashed border, page ground rather
   than card — so it reads as a note, not as a fifth claim.

   HOVER SIGNATURE — the numbered rail. Each row carries a small index plate;
   on hover the whole row's plate and rule light in the accent, so the list
   reads as a sequence rather than four cards. Colour only, and the shared
   rule holds: nothing on this page moves under the cursor.

   ⚠ The admission is `data-placeholder`, and the flag runs the OPPOSITE way
   from most on this project: this copy should be DELETED the day real bios
   and permissioned photographs exist, not confirmed. Do not soften it into
   "our team is growing". */
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
                {/* The rule lives on the item, not as a `divide-y` on the
                    list: divide utilities key off DOM order and would put a
                    rule above the first item if the list ever gained a header.
                    `last:border-0` closes the run. */}
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
            <div
              className="h-full rounded-[1.5rem] border border-dashed border-border bg-secondary p-8 sm:p-10"
              data-placeholder="P1: DELETE this block once real bios and permissioned photographs exist"
            >
              <span className="mb-6 grid size-11 place-items-center rounded-2xl bg-muted text-muted-strong ring-1 ring-border">
                <Icon name="quote-mark" className="size-5" />
              </span>
              <h3 className="mb-4 font-display text-xl font-bold leading-[1.35] tracking-[-0.02em] text-foreground">
                {PEOPLE.gap.title}
              </h3>
              <p className="text-[15px] leading-[1.8] text-muted-strong">
                {PEOPLE.gap.body}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
