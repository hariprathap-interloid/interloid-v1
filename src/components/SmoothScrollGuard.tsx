"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/* ==========================================================================
   Smooth scroll, but not during a route change.
   ==========================================================================
   globals.css sets `html { scroll-behavior: smooth }` so in-page anchors
   glide. It also applies to the App Router's scroll on navigation, and an
   animated scroll-to-top loses the race against the incoming page's layout:
   scroll anchoring settles somewhere mid-page instead of at the top.

   Forcing `window.scrollTo(0, 0)` on pathname change would break back/forward
   restoration, so this only suppresses the animation and lets the router's
   own scrolling stand.

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
