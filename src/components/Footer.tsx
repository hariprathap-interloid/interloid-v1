/* DS §11.2. ONLY links that resolve — HANDOFF §7 flags 20 dead links in the
   live site's footer as a P0 ("fabricated navigation"). The Industries and
   Resources columns are deliberately absent rather than stubbed. The four
   links that do not resolve yet carry data-placeholder so the toggle counts
   them; they are not hidden. Every Company link now resolves — `/careers`
   from 2026-09-07, `/about` from 2026-09-08 — so none of them carries a flag
   any more. The two legal links still do, and those are P0. */
import { CAPABILITIES } from "@/content/service";

/* The six services, matching /services and the live site exactly. Derived
   from CAPABILITIES rather than hand-kept: a footer that names a service the
   services page does not have is how a nav loses trust, and this list has
   already drifted once. */
const SERVICE_LINKS = CAPABILITIES.map((c) => c.name);

/* Typed explicitly. With the last `placeholder` gone from this list, TS
   inferred `{ href, label }` and the conditional spread below stopped
   compiling — the property has to stay OPTIONAL rather than disappear,
   because the next link added before its route exists needs it. */
const COMPANY_LINKS: { href: string; label: string; placeholder?: string }[] = [
  /* "Why us", matching the nav — renamed from "Commitments" with it on
     2026-09-08. Same destination, and one link naming the page two ways is
     how a nav loses trust, so these two lists move together. */
  { href: "/why-choose-us", label: "Why us" },
  { href: "/#process", label: "How we work" },
  { href: "/#work", label: "Selected work" },
  { href: "/#contact", label: "Contact" },
  { href: "/about", label: "About us" },
  { href: "/careers", label: "Careers" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-ink-deep py-20 text-ink-foreground">
      <div className="shell">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div>
            <div className="mb-5 flex items-center gap-2.5">
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
            </div>
            <p className="text-sm leading-relaxed text-ink-foreground/70">
              Senior product engineering. Defined problems to deployed software
              — in your accounts, on your repos.
            </p>
          </div>

          <div>
            <h3 className="mb-6 font-semibold text-white">Services</h3>
            <ul className="space-y-4 text-sm">
              {SERVICE_LINKS.map((l) => (
                <li key={l}>
                  <a href="/services" className="transition-colors hover:text-white">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-6 font-semibold text-white">Company</h3>
            <ul className="space-y-4 text-sm">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="transition-colors hover:text-white"
                    {...(l.placeholder
                      ? { "data-placeholder": l.placeholder }
                      : {})}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-6 font-semibold text-white">Where we are</h3>
            <address
              className="text-sm not-italic leading-relaxed text-ink-foreground/70"
              data-placeholder="confirm address + phone"
            >
              Gobichettipalayam
              <br />
              Tamil Nadu, India
            </address>
            {/* §7 P1: the live site's meta says "Based in US & UK" while the
                only address is Tamil Nadu. This is the honest framing and
                still needs the user's confirmation. */}
            <p
              className="mt-4 text-sm text-ink-foreground/70"
              data-placeholder="P1: confirm geography framing"
            >
              India-based · US &amp; UK overlap hours
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-ink-foreground/60 md:flex-row">
          <p>© 2026 Interloid Technologies Private Limited. All rights reserved.</p>
          <div className="flex gap-6">
            <a
              href="#"
              className="transition-colors hover:text-white"
              data-placeholder="P0 LEGAL: page 404s today"
            >
              Privacy policy
            </a>
            <a
              href="#"
              className="transition-colors hover:text-white"
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
