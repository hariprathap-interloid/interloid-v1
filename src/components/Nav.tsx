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

/* Morphing header: a full-width transparent bar at rest becomes a narrower
   glass pill once scrolled. Desktop links show from `lg:` (1024px); below that
   the mobile menu is the only navigation. Re-check the 1024px fit if a link is
   added. A link added before its route exists should carry `placeholder`. */
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
   silently fall back to nothing lit. Returns null for a route with no link
   rather than guessing one. */
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

/* Theme as external state. `.dark` on <html> is not React's to own: the
   inline script in layout.tsx writes it before hydration. useSyncExternalStore
   subscribes to the DOM instead of mirroring it with setState in an effect.
   The server snapshot is false (light-first); the client re-reads after
   hydration without a mismatch warning. */
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

/* The two morph states, inside the shell. `max-w-full` at rest fills the
   content column; `max-w-6xl` scrolled is the pill, centred by `mx-auto`.

   Every property must have a tweenable value at BOTH ends or the morph snaps:
   `max-w-none` is not a length (hence `max-w-full`), `rounded-full` is an
   infinite radius (hence a constant radius in MORPH; corners are invisible at
   rest), and background, shadow and blur need explicit zeros of the same shape
   (`bg-card/0`, `shadow-none`, `blur(0px)`). */
const REST =
  "max-w-full px-0 py-0 border-transparent bg-card/0 shadow-none [-webkit-backdrop-filter:blur(0px)] [backdrop-filter:blur(0px)]";
const PILL =
  "max-w-6xl px-6 py-2 border-border bg-card/80 shadow-lg [-webkit-backdrop-filter:blur(16px)] [backdrop-filter:blur(16px)]";

/* One duration and one curve for the bar AND the <nav>'s own padding, so the
   height change and the width change land on the same frame. Properties are
   listed rather than `all`, which would also animate every child link's text
   colour on theme toggle. Ease-out so the bar responds to the scroll at once. */
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

  /* ---- scroll ----------------------------------------------------------- */
  useEffect(() => {
    /* Hysteresis: morph at 64px, un-morph only back under 24px. A single
       threshold flips the bar on small wheel ticks near it, reversing the
       500ms morph before it finishes. */
    const onScroll = () =>
      setScrolled((s) => (s ? window.scrollY > 24 : window.scrollY > 64));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Writing the class IS the state update; the store above picks it up.
     Other readers observe the class rather than owning it. */
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

     threshold 0, never a fraction: a tall element cannot reach a fractional
     threshold of a shrunken root at 400% zoom. */
  useEffect(() => {
    /* Home only; elsewhere the route decides. Home itself is not observed: it
       is the default. Leaving a section's band hands the mark back to Home
       only if that section still holds it, since adjacent sections can report
       in either order. */
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
       viewport with no other nav, any later leaves both showing at once. */
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
    /* nowrap + px-3 below `xl:`: otherwise two-word labels wrap at 1024px. */
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
        /* No horizontal padding: the shell owns the gutter, so the logo
           aligns with the page's text column. */
        className={`fixed left-0 right-0 top-0 z-50 transition-[padding] ${EASE} ${scrolled ? "py-3" : "py-6"
          }`}
      >
        <div className="shell">
          <div
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

            <div className="hidden items-center gap-1 rounded-full border border-(--nav-pill-border) bg-card/80 px-3 py-2 p-1 shadow-sm backdrop-blur-sm lg:flex">
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
              {/* Both icons rendered and toggled by class: swapping a button's
                  contents can detach the click's original target. */}
              <button
                type="button"
                onClick={toggleTheme}
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

              <Link
                href="/contact#story"
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

      {/* A closed menu hidden only with opacity/pointer-events keeps its links
          in the tab order. `invisible` is load-bearing. */}
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
              /* Current page: tinted row plus a gradient bar on the leading edge. */
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
            href="/contact#story"
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
