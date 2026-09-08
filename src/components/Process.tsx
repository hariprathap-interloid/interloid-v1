import Icon from "./Icon";
import ProcessPath from "./ProcessPath";
import SectionHeading from "./SectionHeading";
import { STEPS } from "@/content/site";

/* DS §8.9. Still a Server Component; only the connector is client.

   THE CONNECTOR IS A GENERATED PATH — changed 2026-09-07, chosen in
   motion-path-lab.html. It replaced two absolutely-positioned rail divs
   (`left-[39px]` stacked, `top-[44px]` horizontal) whose whole job was
   HANDOFF §5.7: a centred full-height rail draws through centred text, so it
   had to be nudged to run through the nodes instead. A path measured FROM the
   nodes cannot have that problem — it goes through their centres by
   construction, at any width, in either arrangement. §5.7 is satisfied by the
   method now rather than by two magic numbers.

   ProcessPath owns the geometry, the comet and the waypoint lighting. Two
   contracts it depends on, both here:

     data-step   on each <li>. It reads --lit and data-lit back off these, so
                 the numeral ramp and the node fill are driven from scroll
                 position along the path.
     data-node   on the 80px circle. This is what gets measured; the path is
                 built through these rects and nothing else.

   Remove either attribute and the connector silently draws nothing. */
export default function Process() {
  return (
    <section
      id="process"
      className="relative overflow-hidden border-t border-border bg-background py-32"
    >
      <div className="relative z-10 shell">
        {/* Badge is prototype 1's form (icon + sentence case).

            THE ACCENT IS "production." AGAIN. An earlier pass changed it to
            "code you own" on the argument that production is table stakes and
            ownership is the differentiator. That was reversed on 2026-09-07:
            ownership is now stated four times over in the Why Interloid
            section, so repeating it here spent the headline on a point already
            made, and "first call to code you own" describes a deliverable
            where "first call to production" describes the journey the four
            steps below actually walk through. Prototype 1 had it right. */}
        <SectionHeading
          eyebrow="How we work"
          icon="clock"
          accent="production."
          lead="Every step is timeboxed and written down. You always know what happens next and what it costs."
        >
          From first call to
        </SectionHeading>

        <div className="relative mt-20">
          <ProcessPath />
          <ol className="relative z-10 flex flex-col justify-between gap-12 lg:flex-row lg:gap-6">
            {STEPS.map((s, i) => (
              <li
                key={s.n}
                data-reveal
                data-step
                style={{ "--delay": `${i * 120}ms` } as React.CSSProperties}
                className="group relative flex w-full flex-row items-start lg:w-1/4 lg:flex-col lg:items-center"
              >
                <div className="relative flex shrink-0 items-center justify-center">
                  {/* data-node is the measured element. The hover scale here is
                      fine — it runs long after build() — but nothing may move
                      this node's RESTING position with a transition, or the
                      path gets built through a stale rect. */}
                  <div
                    data-node
                    className="relative z-10 grid size-[80px] place-items-center rounded-full border-4 border-card bg-card shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_-5px_rgba(31,93,160,.35)]"
                  >
                    <div className="grid size-14 place-items-center rounded-full bg-brand/10 text-brand ring-1 ring-brand/15 transition-colors duration-500 group-data-[lit=1]:bg-brand group-data-[lit=1]:text-primary-foreground">
                      <Icon name={s.k} className="size-6" />
                    </div>
                  </div>
                  {/* ── NUMERAL PLACEMENT IS THE USER'S, FROM A REFERENCE ──
                      `top: -1.5rem; right: -56px`, given directly and matched
                      to shots/ends-inset.png. The numeral is MEANT to sit
                      behind the node with its leading 0 tucked away — that is
                      the look, not a defect.

                      This reverses an earlier pass that moved it clear of the
                      node entirely. That pass was answering a real measurement
                      (41-46% of the glyph was occluded) but it answered it the
                      wrong way: the reference shows the overlap reads fine
                      because -56px slides the numeral far enough right that
                      what survives is a whole, balanced shape. The problem was
                      never the overlap, it was that at `-right-8` the numeral
                      was cut down its middle.

                      Do not "fix" this back to a clearing position. If the
                      glyph looks wrong, change the RIGHT offset, which is what
                      controls how much of the leading digit survives.

                      Mobile keeps a smaller inset: at -56px the numeral would
                      run under the step's own body copy, which starts 32px to
                      the right of the node in the stacked layout. */}
                  <div
                    style={{ opacity: "calc(0.14 + var(--lit, 0) * 0.38)" }}
                    className="pointer-events-none absolute -top-6 -right-6 z-0 select-none font-display text-[60px] font-bold leading-none text-brand lg:-top-6 lg:-right-14 lg:text-[80px]"
                    aria-hidden="true"
                  >
                    {s.n}
                  </div>
                </div>
                <div className="ml-8 flex flex-col items-start pt-2 text-left lg:ml-0 lg:mt-10 lg:items-center lg:text-center">
                  <span /* `.step__time`: Inter (NOT mono), .1875rem/.625rem padding,
                     .08em tracking, on the page ground rather than muted. */
                  className="mb-2 rounded-full bg-background px-2.5 py-[3px] text-[11px] font-bold uppercase tracking-[0.08em] text-accent-strong ring-1 ring-border">
                    {s.when}
                  </span>
                  <h3 /* `.h-card`: 1.25rem/700/1.25 at every width — it does not step up. */
                  className="mb-3 font-display text-xl font-bold leading-[1.5] tracking-[-0.025em] text-foreground transition-colors group-hover:text-primary">
                    {s.title}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground lg:text-sm xl:text-base">
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
