import Icon from "../Icon";
import { SERVICE_TERMS } from "@/content/service";

/* ==========================================================================
   WHY INTERLOID — five figures, as a band.
   ==========================================================================
   A Server Component: no state, no JS. It is the page's rest beat — DS §18.3
   says vary density, and this thin band sits between the engagement panel and
   the CTA slab exactly where the reference puts nothing at all.

   Figures rather than sentences, because at this point in the page the reader
   is comparing us to somebody else and comparison happens on numbers. All
   five restate commitments made elsewhere on the site (they are HANDOFF §7
   allowed claims); none is new, and none is a client count or a logo — the
   two things the reference leans on and the first two things that read as
   marketing (SERVICE-PAGE-RESEARCH.md §3.2).

   `border-y bg-card` is StackMarquee's band shell, reused so the page has one
   full-width band and it looks like the rest of the site's bands.
   ========================================================================== */
export default function ServiceTerms() {
  return (
    <section
      id="terms"
      aria-labelledby="terms-heading"
      className="border-y border-border bg-card py-20"
    >
      <div className="shell">
        <h2
          id="terms-heading"
          data-reveal
          className="mb-12 max-w-2xl font-display text-2xl font-medium leading-[1.25] tracking-[-0.02em] text-foreground md:text-3xl"
        >
          Every engagement, either way, carries{" "}
          <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
            the same five terms.
          </span>
        </h2>

        <dl className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
          {SERVICE_TERMS.map((t, i) => (
            <div
              key={t.figure}
              data-reveal
              style={{ "--delay": `${i * 80}ms` } as React.CSSProperties}
              className="border-t border-border pt-5"
            >
              <dt className="font-display text-[2rem] font-bold leading-none tracking-[-0.03em] text-foreground">
                {t.figure}
              </dt>
              <dd className="mt-3 text-[14px] leading-[1.6] text-muted-foreground">
                {t.caption}
              </dd>
            </div>
          ))}
        </dl>

        <p
          data-reveal
          style={{ "--delay": "440ms" } as React.CSSProperties}
          className="mt-12 flex items-start gap-2.5 text-[15px] leading-[1.7] text-muted-foreground"
        >
          <span className="mt-0.5 shrink-0 text-accent-strong">
            <Icon name="shield" className="size-5" />
          </span>
          <span>
            These are contract terms, not positioning.{" "}
            <a
              href="/why-choose-us"
              className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:text-accent-strong"
            >
              Read the whole agreement
            </a>{" "}
            before you talk to us, if you would rather.
          </span>
        </p>
      </div>
    </section>
  );
}
