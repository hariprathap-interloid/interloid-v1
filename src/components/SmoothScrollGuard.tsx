"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/* ==========================================================================
   SMOOTH SCROLL, BUT NOT DURING A ROUTE CHANGE.
   ==========================================================================
   globals.css sets `html { scroll-behavior: smooth }` so in-page anchors
   glide — #capabilities, #technologies, /#work, /#contact and the capability
   index all depend on it. The cost is that it also applies to the scroll the
   App Router performs on every navigation, and an ANIMATED scroll-to-top
   loses the race against the incoming page's render: the animation is still
   running when the new (taller) document lays out, and the browser's scroll
   anchoring settles somewhere in the middle of it.

   Measured on 2026-09-12, clicking the header nav from a scrolled-to-top page:

     /services → Why us      y = 5670   (of 6570)
     /services → About us    y = 6083   (of 7248)
     /services → Contact     y = 3010   (of 3910 — the footer)
     /about    → Services    y = 10659  (of 12672)
     /contact  → Services    y = 11233  (of 12672)

   With `scroll-behavior: auto` every one of those lands at y = 0. The
   property is the whole cause, and only during navigation.

   ── WHY THIS SHAPE AND NOT `window.scrollTo(0, 0)` ───────────────────────
   The obvious fix — force the scroll ourselves on every pathname change —
   also breaks BACK and FORWARD, which are supposed to restore the position
   you left. The router already gets that right; the animation is what
   corrupts it. So this suppresses the animation and lets the router's own
   scrolling stand, rather than replacing it.

   The click listener is on the CAPTURE phase so the property is set before
   the router moves, and only for links that change the pathname — a
   same-page `#hash` link keeps its glide, which is the behaviour worth
   having. `popstate` is covered too, because a restored position should land
   instantly for the same reason a new one should.

   Restoring is on a timer rather than a frame: the router's scroll can land
   a few frames after the route commits, and re-enabling smooth too early
   puts the animation right back in the middle of it.
   ========================================================================== */
const RESTORE_MS = 300;

export default function SmoothScrollGuard() {
  const pathname = usePathname();

  useEffect(() => {
    const suppress = () => {
      document.documentElement.style.scrollBehavior = "auto";
    };

    const onClick = (e: MouseEvent) => {
      /* Modified clicks open a new tab — this document never scrolls. */
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const anchor = (e.target as Element | null)?.closest?.("a");
      const href = anchor?.getAttribute("href");
      if (!href) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      /* Off-site, or a jump within this page: leave the glide alone. */
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;
      suppress();
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", suppress);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", suppress);
    };
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      document.documentElement.style.scrollBehavior = "";
    }, RESTORE_MS);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
