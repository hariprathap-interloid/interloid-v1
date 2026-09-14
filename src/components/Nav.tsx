"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/* DS §6.1 morphing pill: width (max-w-7xl→6xl), surface (transparent→glass)
   and radius (0→rounded-full) animate together over 300ms.
   HANDOFF §4 said 8 links; it is 6 since 2026-09-08. Stack and Process were
   removed on request and Commitments became "Why us" — the two removed
   SECTIONS still exist (StackMarquee on /services, Process on home) and are
   reachable by scrolling; only their nav shortcuts are gone.

   Desktop pill at `lg:` (1024px); below that the mobile menu. It moved down
   from `xl:` (1280px) on 2026-09-11 — measured with the pill forced on, all six
   links sit on one row at 1024 with 67px clear either side at rest and 42px
   once scrolled into the narrower PILL, so the 1024–1279 band was showing a
   hamburger on a header with room to spare. Re-measure if a link is added.

   EVERY LINK IS `next/link` FROM 2026-09-12, logo included. They were plain
   `<a>`, so each one was a full document reload — the nav lint names the
   logo specifically (no-html-link-for-pages), but the cost was the same on
   all of them. Link keeps the `onClick={() => setOpen(false)}` the mobile
   rows need, and the scrollspy still reads `l.href` from LINKS rather than
   from the DOM, so nothing below changed with it.

   ACTIVE STATE FOLLOWS THE ROUTE FROM 2026-09-14. It used to come ONLY from
   the scrollspy, which watches `/#id` fragments — and five of the seven
   links are pages now, so on /services, /about, /careers, /why-choose-us and
   /contact nothing was ever marked current. The route decides first
   (`usePathname`, exact or nested match); the scrollspy only runs on `/`,
   where it still splits Home from Work. See `activeHref` below.

   Every link
   resolves: `/careers` shipped 2026-09-07 and `/about` 2026-09-08, so the
   `data-placeholder` flags this list used to carry are both gone. If a link
   is ever added before its route exists, flag it here rather than hiding it —
   the toggle counting a dead link is the point. */
const LINKS = [
  { href: "/#home", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/why-choose-us", label: "Why us" },
  { href: "/about", label: "About us" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
] as const;

const HOME_HREF = "/#home";

/* The fragment links other than Home — the only ones the scrollspy watches. */
const SECTION_LINKS = LINKS.filter(
  (l) => l.href.startsWith("/#") && l.href !== HOME_HREF,
);

/* The route decides; the scrollspy only breaks the tie on `/`. A nested
   match counts (`/services/x` lights Services) so a future sub-page does not
   silently fall back to nothing lit. Returns null for a route with no link —
   the labs and previews — rather than guessing one. */
function activeHref(pathname: string, homeSection: string): string | null {
  if (pathname === "/") return homeSection;
  const hit = LINKS.find(
    (l) =>
      !l.href.includes("#") &&
      (pathname === l.href || pathname.startsWith(l.href + "/")),
  );
  return hit ? hit.href : null;
}

/* `page` for a route, `location` for a section inside one — they are
   different claims to a screen reader, and "Work" is not a page. */
function ariaCurrent(href: string, active: string | null) {
  if (href !== active) return undefined;
  return SECTION_LINKS.some((l) => l.href === href) ? "location" : "page";
}

/* THEME AS EXTERNAL STATE.
   `.dark` on <html> is not React's to own: the inline script in layout.tsx
   writes it before hydration, and HeroStage reads it too. Mirroring it into
   useState meant a setState inside an effect — which the react-hooks lint
   correctly rejects, because that is a cascading render on every mount.
   useSyncExternalStore is the right shape: React subscribes to the DOM.

   getServerSnapshot returns false because the page is light-first; the inline
   script corrects it before first paint, and useSyncExternalStore re-reads
   after hydration without a mismatch warning. */
const subscribeTheme = (onChange: () => void) => {
  const obs = new MutationObserver(onChange);
  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => obs.disconnect();
};
const getTheme = () => document.documentElement.classList.contains("dark");
const getServerTheme = () => false;

/* The two states of DS §6.1's morph, now expressed INSIDE the shell rather
   than as page widths of their own. `max-w-full` at rest is what makes the
   bar fill the content column exactly; `max-w-6xl` scrolled is the same
   1152px pill it has always been, centred by `mx-auto`.

   ── WHY THE MORPH USED TO SNAP (fixed 2026-09-14) ───────────────────────
   It had `transition-all` and still read as one bar being hidden and another
   appearing, because nearly every property had NO VALUE TO TWEEN FROM:
     · `max-w-none` → `max-w-6xl`. `none` is not a length; the browser cannot
       interpolate it and jumps straight to 1152px. `max-w-full` (100%) can.
     · `rounded-full` is an infinite radius, so 0 → ∞ is "fully round" on the
       first frame. The radius is now CONSTANT (MORPH below) — at rest the
       bar is transparent and borderless, so its corners are invisible.
     · background, shadow and blur existed only in PILL. Each now has an
       explicit zero in REST of the same shape: `bg-card/0`, `shadow-none`
       (same composed shadow list as `shadow-lg`, just zeroed), and
       `blur(0px)` as a literal filter so both ends are a `blur()` function.
   Every REST class must keep a tweenable counterpart in PILL. Adding a
   property to only one side brings the snap back. */
const REST =
  "max-w-full px-0 py-0 border-transparent bg-card/0 shadow-none [-webkit-backdrop-filter:blur(0px)] [backdrop-filter:blur(0px)]";
const PILL =
  "max-w-6xl px-6 py-2 border-border bg-card/80 shadow-lg [-webkit-backdrop-filter:blur(16px)] [backdrop-filter:blur(16px)]";

/* One duration and one curve for the bar AND the <nav>'s own padding, so the
   height change and the width change land on the same frame. Properties are
   listed rather than `all`: `all` also animated the text colour of every
   child link on each theme toggle. The curve is an ease-out — the bar
   responds immediately to the scroll and settles, where ease-in-out held
   still for the first ~80ms and then lurched. */
const EASE = "duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]";
const MORPH = `rounded-[2.5rem] transition-[max-width,padding,background-color,border-color,box-shadow,backdrop-filter,-webkit-backdrop-filter] ${EASE}`;

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const dark = useSyncExternalStore(subscribeTheme, getTheme, getServerTheme);
  const pathname = usePathname();
  /* Which home fragment is being read. Only consulted on `/`. */
  const [homeSection, setHomeSection] = useState<string>(HOME_HREF);

  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  /* ---- scroll -------------------------------------------------------------
     Passive listener, and it must be removed on unmount: without a cleanup,
     hot reload stacks a fresh listener on every edit (TAILWIND-MAP §4). This
     is a failure mode the static prototype could not have. */
  useEffect(() => {
    /* Hysteresis: morph at 64px, un-morph only back under 24px. One 50px
       line flipped the bar on every small wheel tick near the top, so a
       500ms morph kept being reversed halfway and never finished. */
    const onScroll = () =>
      setScrolled((s) => (s ? window.scrollY > 24 : window.scrollY > 64));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Writing the class IS the state update — the store above picks it up.
     HeroStage observes the same class rather than owning it; two owners is a
     race (HANDOFF §5.19). */
  const toggleTheme = useCallback(() => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("interloid-theme", next ? "dark" : "light");
    } catch { }
  }, []);

  /* ---- scrollspy ----------------------------------------------------------
     Marks the nav link whose section is in the reading band. rootMargin
     "-45% 0px -50%" leaves a thin strip across the middle of the viewport, so
     a section counts as current only while it is actually being read.

     threshold 0, never a fraction — HANDOFF §5.6: a tall element cannot reach
     a fractional threshold of a shrunken root at 400% zoom, and every section
     here is taller than the strip. */
  useEffect(() => {
    /* Home only. Every other link is a page and the route answers for it.
       Home itself is not observed: it is the DEFAULT, so the stretch between
       the hero and #work (Advantage, Process) and everything after it reads
       as "Home" rather than leaving Work lit on the FAQ. Leaving a section's
       band hands the mark back to Home, but only if that section still holds
       it — two adjacent sections can report in either order. */
    if (pathname !== "/") return;
    const targets = SECTION_LINKS.map((l) =>
      document.getElementById(l.href.slice(2)),
    ).filter(Boolean) as Element[];
    if (!targets.length) return;

    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const href = `/#${e.target.id}`;
          if (e.isIntersecting) setHomeSection(href);
          else setHomeSection((prev) => (prev === href ? HOME_HREF : prev));
        });
      },
      { threshold: 0, rootMargin: "-45% 0px -50% 0px" },
    );
    targets.forEach((t) => spy.observe(t));
    return () => spy.disconnect();
  }, [pathname]);

  const active = activeHref(pathname, homeSection);

  /* ---- mobile menu: outside click, Escape, and breakpoint ---------------- */
  useEffect(() => {
    if (!open) return;

    const onDocClick = (e: MouseEvent) => {
      const path = e.composedPath();
      if (
        menuRef.current &&
        toggleRef.current &&
        !path.includes(menuRef.current) &&
        !path.includes(toggleRef.current)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    /* MUST match the pill's breakpoint exactly (`lg:`, 1024px). Below it the
       mobile menu is the ONLY navigation, so the menu may auto-close only at
       the width where the pill takes over: any earlier shuts the menu on a
       viewport with no other nav (the prototype's bug), any later leaves both
       showing at once. */
    const mq = window.matchMedia("(min-width: 1024px)");
    const onBreak = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };

    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onBreak);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onBreak);
    };
  }, [open]);

  const linkClass = (href: string) =>
    /* nowrap + px-3 below `xl:`: with the seventh link ("Contact",
       2026-09-11) the labels at 1024px wrapped — "Why / us", "About / us" —
       inside a pill that still measured clear of the CTA. */
    `nav-link whitespace-nowrap rounded-full px-3 py-2 text-sm transition-all hover:bg-card hover:text-primary xl:px-4 ${active === href
      /* Shadow from a token, not `shadow-sm`: the dark value has to be a
         different COLOUR — see --nav-active-shadow in globals.css. Light
         mode resolves to exactly `shadow-sm`. */
      ? "bg-card text-primary font-semibold shadow-(--nav-active-shadow)"
      : "font-medium text-muted-foreground"
    }`;

  return (
    <>
      <nav
        id="nav"
        aria-label="Primary"
        /* No `px-4` here any more: the gutter is the shell's, so the logo
           starts exactly where the page's first line of text starts. Adding
           one back would offset the header from the page by 16px at every
           width — which is how this was wrong before. */
        className={`fixed left-0 right-0 top-0 z-50 transition-[padding] ${EASE} ${scrolled ? "py-3" : "py-6"
          }`}
      >
        <div className="shell">
          <div
            /* A STABLE HOOK. `.verify.mjs` addressed this element as
               `#nav > div`, which broke the moment the shell wrapper went in
               between — the morph still worked, the check just pointed at the
               wrong node. An attribute survives markup changes; a position
               does not. */
            data-navbar
            className={`relative mx-auto flex w-full items-center justify-between gap-6 border ${MORPH} ${scrolled ? PILL : REST
              }`}
          >
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2.5 rounded-full"
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
              <span className="font-display text-lg font-bold tracking-tight text-foreground">
                Interloid
              </span>
            </Link>

            {/* §6.2 a pill inside a pill */}
            <div className="hidden items-center gap-1 rounded-full border border-white/40 bg-card/80 px-3 py-2 p-1 shadow-sm backdrop-blur-sm lg:flex">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={linkClass(l.href)}
                  aria-current={ariaCurrent(l.href, active)}
                  {...("placeholder" in l
                    ? { "data-placeholder": l.placeholder }
                    : {})}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* Two SVGs toggled by class, never innerHTML — HANDOFF §5.3:
                replacing a button's contents detaches the click's original
                target. React keeps the node stable, but rendering both and
                hiding one means the bug cannot come back by refactor. */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-pressed={dark}
                aria-label={
                  dark ? "Switch to light theme" : "Switch to dark theme"
                }
                className="grid size-11 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"
              >
                <svg
                  data-icon="moon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`size-5 ${dark ? "hidden" : ""}`}
                  aria-hidden="true"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
                <svg
                  data-icon="sun"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`size-5 ${dark ? "" : "hidden"}`}
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              </button>

              {/* /contact — the "tell us your story" enquiry — since
                  2026-09-11. It was "/#contact", home's closing slab, whose own
                  button now leads to /contact too; linking straight there
                  saves every page a scroll-and-click. */}
              <Link
                href="/contact"
                className="hidden whitespace-nowrap rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-brand-light hover:shadow-primary/40 active:scale-95 lg:inline-flex"
              >
                Let&apos;s talk
              </Link>

              <button
                ref={toggleRef}
                type="button"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="mobileMenu"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((o) => !o);
                }}
                className="grid size-11 place-items-center rounded-full text-foreground transition-colors hover:bg-muted lg:hidden"
              >
                <svg
                  data-icon="menu"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className={`size-6 ${open ? "hidden" : ""}`}
                  aria-hidden="true"
                >
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h16" />
                </svg>
                <svg
                  data-icon="close"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className={`size-6 ${open ? "" : "hidden"}`}
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HANDOFF §5.4: a closed menu hidden only with opacity/pointer-events
          keeps its links in the tab order. `invisible` is load-bearing. */}
      <div
        ref={menuRef}
        id="mobileMenu"
        className={`fixed left-4 right-4 top-24 z-40 origin-top rounded-3xl border border-border bg-card p-6 shadow-2xl transition-all duration-300 ease-in-out lg:hidden ${open
            ? "visible scale-100 opacity-100"
            : "invisible scale-95 opacity-0"
          }`}
      >
        <nav aria-label="Mobile" className="flex flex-col">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              aria-current={ariaCurrent(l.href, active)}
              /* The menu had no current state at all. Below `lg` it is the
                 only navigation, so it needs the plainest one: a tinted row
                 and a gradient bar on the leading edge. */
              className={`relative flex items-center justify-between rounded-xl px-4 py-3.5 font-display text-lg font-semibold transition-colors ${active === l.href
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-muted hover:text-primary"
                }`}
              {...("placeholder" in l
                ? { "data-placeholder": l.placeholder }
                : {})}
            >
              {active === l.href && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-linear-to-b from-brand to-accent"
                />
              )}
              {l.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="mt-4 inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full bg-primary px-5 text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 active:scale-95 sm:px-6 sm:text-base"
          >
            {/* The panel leaves ~265px on a phone; the full label wrapped to
                two lines inside the fixed-height pill. */}
            <span className="sm:hidden">Book a free consult</span>
            <span className="hidden sm:inline">Book a free 30-min consult</span>
          </Link>
        </nav>
      </div>
    </>
  );
}
