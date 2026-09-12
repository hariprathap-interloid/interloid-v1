/* DS §11.2. ONLY links that resolve — HANDOFF §7 flags 20 dead links in the
   live site's footer as a P0 ("fabricated navigation"). The Industries and
   Resources columns are deliberately absent rather than stubbed.

   ── REDESIGNED 2026-09-12 ────────────────────────────────────────────────
   Three things were wrong, and only one of them was visual:

     1. THE SERVICES COLUMN WAS SIX LINKS TO ONE PLACE. Every service name
        pointed at bare `/services`, so a visitor who clicked "Mobile App
        Development" landed at the top of the page and had to find it again.
        CapabilityShowcase already renders an id of `capability-<k>` on each
        block with `scroll-mt-32`, so the deep link was there to be used and
        was not. The names and the anchors are BOTH derived from CAPABILITIES
        now, which is the only way the two stay in step.
     2. NO FOCUS RING ON A DARK SURFACE. globals.css ships `.on-dark` for
        exactly this — the default ring draws `--background` (light) as its
        inner stop, which on #020618 is a white halo rather than a ring.
        Every link here now carries `on-dark`.
     3. `<a>` FOR INTERNAL ROUTES. Most of these are real route changes and
        each one was a full document load. They are `next/link` now; `tel:`,
        `mailto:` and the unresolved legal links stay plain `<a>`, which is
        what they are.

   Layout is a 12-column grid at `lg`, split 3/3/2/2/2. The identity block
   was tried at 5 wide with the address folded into it; screenshotted at
   1440 that left ~250px of dead ground between the tagline and the Services
   column and stacked all the height on the left, so "Where we are" is its
   own column again and the identity block is only as wide as its copy.
   Below `lg` it is two columns, and one on phones.

   THE LEGAL ROW IS UNCHANGED AND STILL FLAGGED. `/privacy` and `/terms` do
   not exist; both links keep `href="#"` and their P0 `data-placeholder` so
   the toggle keeps counting them. Do not "fix" these by pointing them at a
   page that is not a policy. */
import Link from "next/link";
import { CAPABILITIES } from "@/content/service";

type FooterLink = { href: string; label: string; placeholder?: string };

/* The six services, matching /services exactly. Derived from CAPABILITIES
   rather than hand-kept: a footer that names a service the services page
   does not have is how a nav loses trust, and this list has already drifted
   once. The anchor is the capability's own `k`, i.e. the same key the
   showcase renders its id from — rename a key there and this follows. */
const SERVICE_LINKS: FooterLink[] = CAPABILITIES.map((c) => ({
  href: `/services#capability-${c.k}`,
  label: c.name,
}));

/* Pages. Every one is a route that exists — /careers from 2026-09-07,
   /about from 2026-09-08, /contact (the enquiry page, not "/#contact")
   from 2026-09-11 — so none carries a flag. `placeholder` stays OPTIONAL on
   the type rather than disappearing: the next link added before its route
   exists needs it, and flagging a dead link is the point of the toggle. */
const COMPANY_LINKS: FooterLink[] = [
  { href: "/about", label: "About us" },
  { href: "/why-choose-us", label: "Why us" },
  { href: "/services", label: "Services" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

/* Sections rather than pages — each one is an id that is rendered today:
   #process (Process.tsx), #work (Work.tsx) and #faq (Faq.tsx) on home,
   #agreement (Clauses.tsx) on /why-choose-us, #technologies (TechStacks.tsx)
   on /services. globals.css's `scroll-padding-top: 7rem` clears the nav, so
   none of these needs a per-target offset. Verify the id before adding a row
   here; a fragment that matches nothing fails silently at the top of the
   page, which is the worst kind of dead link. */
const EXPLORE_LINKS: FooterLink[] = [
  { href: "/#process", label: "How we work" },
  { href: "/#work", label: "Selected work" },
  { href: "/why-choose-us#agreement", label: "Working agreement" },
  { href: "/services#technologies", label: "Technologies" },
  { href: "/#faq", label: "Common questions" },
];

const LINK =
  "on-dark rounded-sm text-sm text-ink-foreground/75 transition-colors hover:text-white";

const HEADING =
  "mb-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50";

function LinkColumn({
  heading,
  links,
}: {
  heading: string;
  links: FooterLink[];
}) {
  return (
    <div>
      <h3 className={HEADING}>{heading}</h3>
      <ul className="space-y-3.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className={LINK}
              {...(l.placeholder ? { "data-placeholder": l.placeholder } : {})}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-ink-deep py-20 text-ink-foreground">
      <div className="shell">
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-12">
          {/* ---- identity, address, contact ----------------------------- */}
          <div className="sm:col-span-2 lg:col-span-3 lg:pr-8">
            <Link
              href="/"
              className="on-dark mb-5 inline-flex items-center gap-2.5 rounded-full"
              aria-label="Interloid home"
            >
              <span
                className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-accent text-white"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5"
                >
                  <path d="M12 2 2 7l10 5 10-5-10-5Z" />
                  <path d="m2 17 10 5 10-5" />
                  <path d="m2 12 10 5 10-5" />
                </svg>
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-white">
                Interloid
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-ink-foreground/70">
              Senior product engineering. Defined problems to deployed software
              — in your accounts, on your repos.
            </p>

            {/* The one outbound action in the footer, and it goes to
                /contact — the same enquiry the nav's "Contact" and
                CtaAnchor's button open. Three entry points, one destination,
                which is what stops a footer CTA from becoming a fourth
                funnel nobody maintains. `--ink-cta` is the theme-independent
                blue the CTA slab uses; --brand shifts in dark and this
                surface does not. */}
            <Link
              href="/contact"
              className="on-dark group mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-ink-cta px-5 text-sm font-semibold text-white transition-colors hover:bg-ink-cta-hover"
            >
              Start a project
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>

          </div>

          {/* ---- the three link columns --------------------------------- */}
          <div className="lg:col-span-3">
            <LinkColumn heading="Services" links={SERVICE_LINKS} />
          </div>
          <div className="lg:col-span-2">
            <LinkColumn heading="Company" links={COMPANY_LINKS} />
          </div>
          <div className="lg:col-span-2">
            <LinkColumn heading="Explore" links={EXPLORE_LINKS} />
          </div>

          {/* ---- where we are ------------------------------------------- */}
          <div className="lg:col-span-2">
            <h3 className={HEADING}>Where we are</h3>
            <address className="text-sm not-italic leading-relaxed text-ink-foreground/70">
              No. 82/1, First Floor, Jai Marappa Complex
              <br />
              Sri Aishwariyam Nagar, Karattadipalayam
              <br />
              Gobichettipalayam, Tamil Nadu 638453
            </address>
            {/* Stacked with padding, not <br>: two 20px lines touching
                failed the tap-target check (Lighthouse, 2026-09-11) — a
                thumb aimed at the number could hit the email. */}
            <div className="mt-3 flex flex-col items-start">
              <a href="tel:+919042032424" className={`${LINK} py-1.5`}>
                +91 9042032424
              </a>
              <a href="mailto:connect@interloid.com" className={`${LINK} py-1.5`}>
                connect@interloid.com
              </a>
            </div>
            {/* /70, not /50: at 12px the fainter grey measured 3.9:1 on the
                footer's ink (Lighthouse, 2026-09-11); /70 matches the lines
                above. */}
            <p className="mt-2 text-xs text-ink-foreground/70">
              India-based · US &amp; UK overlap hours
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-ink-foreground/60 md:flex-row">
          <p>
            © 2026 Interloid Technologies Private Limited. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="on-dark rounded-sm transition-colors hover:text-white"
              data-placeholder="P0 LEGAL: page 404s today"
            >
              Privacy policy
            </a>
            <a
              href="#"
              className="on-dark rounded-sm transition-colors hover:text-white"
              data-placeholder="P0 LEGAL: page missing"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
