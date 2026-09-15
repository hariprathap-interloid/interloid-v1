import type { Metadata } from "next";
import { pageMeta } from "@/content/seo";
import Link from "next/link";
import ApplyForm from "@/components/apply/ApplyForm";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";
import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";
import { APPLY_HERO, APPLY_NEXT, APPLY_TERMS } from "@/content/apply";
import { ROLES } from "@/content/site";

export const metadata: Metadata = pageMeta(
  "/careers/apply",
  "Apply for a trainee developer role",
  "Apply for an on-site trainee developer role in Gobichettipalayam: React, Ruby on Rails, Python or Node.js. Your details and CV, no account needed.",
);

/* Trainee application: hero, the form, and an aside (next steps + terms) that
   is sticky beside the form on desktop and below it on phones. `?role=<id>`
   preselects a role. Intentionally absent from the nav and footer. */
export default async function Apply({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { role } = await searchParams;
  const initialRole =
    typeof role === "string" && ROLES.some((r) => r.id === role) ? role : null;

  return (
    <>
      <Reveal />
      <Nav />
      <main id="main">
        <section className="relative overflow-clip border-b border-border bg-secondary pb-14 pt-32 lg:pb-20 lg:pt-40">
          <div
            className="pointer-events-none absolute right-0 top-0 size-[520px] translate-x-1/3 -translate-y-1/4 rounded-full bg-accent/15 blur-[120px]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 size-[420px] -translate-x-1/3 translate-y-1/3 rounded-full bg-brand/15 blur-[120px]"
            aria-hidden="true"
          />
          <div className="relative z-10 shell">
            <div className="max-w-3xl">
              <Link
                href="/careers#openings"
                data-reveal
                className="group -my-2 mb-6 inline-flex items-center gap-2 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
              >
                <span className="rotate-180 transition-transform group-hover:-translate-x-1">
                  <Icon name="arrow" className="size-4" />
                </span>
                All four roles
              </Link>
              <div>
                <div
                  data-reveal
                  className="mb-6 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-card px-4 py-2 text-sm font-medium leading-[1.5] shadow-sm"
                >
                  <span className="text-accent-strong">
                    <Icon name="user-check" className="size-4" />
                  </span>
                  <span className="text-muted-foreground">{APPLY_HERO.eyebrow}</span>
                </div>
              </div>
              <h1
                data-reveal
                style={{ "--delay": "100ms" } as React.CSSProperties}
                className="font-display text-4xl font-medium leading-[1.1] tracking-[-0.025em] text-foreground md:text-5xl lg:text-[3.5rem] 2xl:text-[4rem]"
              >
                {APPLY_HERO.head}
                <br />
                <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
                  {APPLY_HERO.accent}
                </span>
              </h1>
              <p
                data-reveal
                style={{ "--delay": "200ms" } as React.CSSProperties}
                className="mt-6 max-w-2xl text-lg leading-[1.6] text-muted-foreground"
              >
                {APPLY_HERO.lead}
              </p>
            </div>
          </div>
        </section>

        <section className="relative overflow-clip bg-background py-16 lg:py-24">
          <div
            className="pointer-events-none absolute right-0 top-1/3 size-[560px] translate-x-1/2 rounded-full bg-brand/8 blur-[120px]"
            aria-hidden="true"
          />
          <div className="relative z-10 shell grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
            <div
              data-reveal
              style={{ "--delay": "260ms" } as React.CSSProperties}
              className="min-w-0 lg:col-span-8"
            >
              <ApplyForm initialRole={initialRole} />
            </div>

            <aside className="space-y-6 lg:sticky lg:top-28 lg:col-span-4">
              <div
                data-reveal
                style={{ "--delay": "320ms" } as React.CSSProperties}
                className="rounded-[1.5rem] border border-border bg-card p-6 shadow-sm sm:p-8"
              >
                <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-foreground">
                  What happens next
                </h2>
                <ol className="mt-6 space-y-6">
                  {APPLY_NEXT.map((s, i) => (
                    <li key={s.title} className="flex gap-4">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/10 font-display text-sm font-bold text-brand ring-1 ring-brand/15">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-foreground">{s.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div
                data-reveal
                style={{ "--delay": "380ms" } as React.CSSProperties}
                data-placeholder="P1: confirm these terms against the offer letter"
                className="rounded-[1.5rem] border border-border bg-secondary p-6 sm:p-8"
              >
                <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-strong">
                  The terms, for all four roles
                </h2>
                <dl className="mt-5 divide-y divide-border">
                  {APPLY_TERMS.map((t) => (
                    <div key={t.label} className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0">
                      <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        {t.label}
                      </dt>
                      <dd className="text-[15px] font-medium text-foreground">{t.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
