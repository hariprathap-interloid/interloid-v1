import SectionHeading from "./SectionHeading";
import { ANSWERS } from "@/content/site";

/* "Straight answers to the awkward questions".

   No accordion, deliberately: the section's argument is that nothing is
   withheld, and hiding the answers behind a click would undercut it. That is
   also why this does not reuse Faq.tsx — same shape of content, opposite
   behaviour. */
export default function Answers() {
  return (
    <section
      id="answers"
      className="relative overflow-hidden border-t border-border bg-background py-32"
    >
      <div
        className="pointer-events-none absolute bottom-0 right-0 size-[520px] translate-x-1/3 translate-y-1/3 rounded-full bg-accent/10 blur-[120px]"
        aria-hidden="true"
      />
      <div className="relative z-10 shell">
        <SectionHeading
          eyebrow="No sales call required"
          icon="search"
          accent="awkward questions."
          lead="The things buyers usually have to sit through a pitch to find out. All open, no accordion."
        >
          Straight answers to the
        </SectionHeading>

        <div className="grid gap-6 md:grid-cols-2">
          {ANSWERS.map((a, i) => (
            <div
              key={a.q}
              data-reveal
              style={{ "--delay": `${i * 90}ms` } as React.CSSProperties}
              className="h-full"
            >
              <article className="flex h-full flex-col rounded-[1.5rem] border border-border bg-card p-8 shadow-sm transition-[border-color,box-shadow] duration-300 ease-out hover:border-accent/30 hover:shadow-md">
                <h3 className="mb-3 flex items-start gap-3 font-display text-lg font-bold leading-[1.4] tracking-[-0.015em] text-foreground">
                  {/* The Qn marker is decorative numbering, not part of the
                      question — a screen reader reading "Q1 Where are you
                      actually based?" gains nothing. */}
                  <span
                    className="mt-0.5 shrink-0 rounded-md bg-accent/10 px-2 py-0.5 font-display text-[13px] font-bold text-accent-strong"
                    aria-hidden="true"
                  >
                    Q{i + 1}
                  </span>
                  {a.q}
                </h3>
                <p className="leading-[1.7] text-muted-foreground">{a.a}</p>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
