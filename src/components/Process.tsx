import Icon from "./Icon";
import ProcessPath from "./ProcessPath";
import SectionHeading from "./SectionHeading";
import { STEPS } from "@/content/site";

/* A Server Component; only the connector (ProcessPath) is client.

   The connector is built from the measured node positions, so it passes
   through every node centre at any width, in either arrangement. ProcessPath
   owns the geometry, the comet and the waypoint lighting, and depends on two
   attributes here:

     data-step   on each <li>. ProcessPath writes --lit and data-lit onto
                 these, driving the numeral opacity and the node fill.
     data-node   on the 80px circle. This is what gets measured; the path is
                 built through these and nothing else.

   Remove either attribute and the connector silently draws nothing. */
export default function Process() {
  return (
    <section
      id="process"
      className="relative overflow-hidden border-t border-border bg-background py-32"
    >
      <div className="relative z-10 shell">
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
                  {/* The numeral deliberately sits partly BEHIND the node, its
                      leading 0 tucked away; the right offset controls how much
                      of that digit survives, so tune it rather than clearing
                      the overlap. Below lg the inset is smaller so the numeral
                      does not run under the step's body copy. */}
                  <div
                    style={{ opacity: "calc(0.14 + var(--lit, 0) * 0.38)" }}
                    className="pointer-events-none absolute -top-6 -right-6 z-0 select-none font-display text-[60px] font-bold leading-none text-brand lg:-top-6 lg:-right-14 lg:text-[80px]"
                    aria-hidden="true"
                  >
                    {s.n}
                  </div>
                </div>
                <div className="ml-8 flex flex-col items-start pt-2 text-left lg:ml-0 lg:mt-10 lg:items-center lg:text-center">
                  <span /* Body face, not monospace, on the page ground rather
                     than muted. */
                  className="mb-2 rounded-full bg-background px-2.5 py-[3px] text-[11px] font-bold uppercase tracking-[0.08em] text-accent-strong ring-1 ring-border">
                    {s.when}
                  </span>
                  <h3 /* Same size at every width — card titles do not step up. */
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
