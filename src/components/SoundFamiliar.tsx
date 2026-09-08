import Icon from "./Icon";
import { CAPABILITIES, SERVICE_PROBLEMS } from "@/content/service";

/* "Sound familiar?" — CLAUDE.md §7.2: the four problem→answer pairs from
   prototype2-archive's `#problems`.

   The archive's composition is kept: a sticky left column holding the section
   head while the pairs scroll past on the right — the one place this site uses
   sticky positioning, and it is the point of the section (the question stays
   on screen while the answers change).

   Server Component: the interaction is scroll, which CSS owns. `lg:sticky`
   only — below lg the column stacks, and sticky would pin a heading over the
   content on short viewports.

   ── WHY THE CAPABILITY LINK IS OPTIONAL ───────────────────────────────────
   Each answer maps to a CAPABILITIES entry, and where a page exists that
   explains that capability the answer routes to it — the label is derived
   from the capability list so there is no second hand-kept one. `/services`
   was rebuilt on 2026-09-08 and does have `#capabilities`, so a caller can
   now pass `capabilitiesHref="/services#capabilities"`; with no prop the
   answers simply end without a link. Never hardcode a bare `#capabilities`
   here — a fragment is a silent no-op on any page that lacks the section
   (CLAUDE.md gotcha 9), and this component renders on /why-choose-us.

   ⚠ THE CONTENT IS SHARED WITH /services. Both this section and that page's
   ProblemLedger read SERVICE_PROBLEMS, so the same client sentences appear
   on two pages in two compositions. That was true the moment /services came
   back and it is a content decision, not a bug — but it is worth settling:
   the ledger on /services is the one built for this material, and it opens
   each answer on demand rather than printing all of them. */
export default function SoundFamiliar({
  capabilitiesHref,
}: {
  capabilitiesHref?: string;
}) {
  const nameOf = (key: string) =>
    CAPABILITIES.find((c) => c.k === key)?.name ?? "See the capability";

  return (
    <section
      id="problems"
      className="relative overflow-hidden border-t border-border bg-background py-32"
    >
      <div
        className="pointer-events-none absolute right-0 top-0 size-[500px] -translate-y-1/2 translate-x-1/2 rounded-full bg-brand/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative z-10 shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <div
                data-reveal
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium leading-[1.5] shadow-sm"
              >
                <span className="text-accent-strong">
                  <Icon name="quote" className="size-4" />
                </span>
                <span className="text-muted-foreground">The problem</span>
              </div>
              <h2
                data-reveal
                style={{ "--delay": "100ms" } as React.CSSProperties}
                className="font-display text-4xl font-medium leading-[1.1] tracking-[-0.025em] text-foreground md:text-5xl lg:text-[3.5rem]"
              >
                Sound{" "}
                <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
                  familiar?
                </span>
              </h2>
              <p
                data-reveal
                style={{ "--delay": "200ms" } as React.CSSProperties}
                className="mt-6 text-lg leading-[1.5] text-muted-foreground"
              >
                Most teams don&rsquo;t come to us for &ldquo;software
                development.&rdquo; They come with one of these four sentences.
                Each has a concrete answer.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-7">
            {SERVICE_PROBLEMS.map((p, i) => (
              <article
                key={p.q}
                data-reveal
                style={{ "--delay": `${i * 90}ms` } as React.CSSProperties}
                className="group rounded-[1.5rem] border border-border bg-card p-7 shadow-sm transition-[border-color,box-shadow] duration-300 ease-out hover:border-accent/30 hover:shadow-lg sm:p-8"
              >
                {/* The problem, in the client's voice — quoted, not titled. */}
                <h3 className="font-display text-xl font-bold leading-[1.35] tracking-[-0.02em] text-foreground sm:text-2xl">
                  &ldquo;{p.q}&rdquo;
                </h3>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-accent-strong">
                  Our answer
                </p>
                <p className="mt-2 text-[15px] leading-[1.7] text-muted-foreground">
                  {p.a}
                </p>
                {capabilitiesHref && (
                  <a
                    href={capabilitiesHref}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-accent-strong"
                  >
                    {nameOf(p.to)}
                    <span className="transition-transform group-hover:translate-x-1">
                      <Icon name="arrow" className="size-4" />
                    </span>
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
