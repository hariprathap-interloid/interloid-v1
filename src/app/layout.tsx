import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

/* Body face. Self-hosted by next/font — no <link>, no render-blocking request
   to fonts.googleapis.com, and no first-paint layout shift. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/* Display face for EVERY section heading, card title and label: Outfit, which
   is what prototype 1 used. Satoshi is now reserved for the hero H1 only —
   the user's call, and it is a defensible one: one distinctive face used once,
   at the largest size on the page, reads as deliberate; used everywhere it
   just becomes the body font's louder sibling. */
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

/* Hero H1 only. Satoshi is a Fontshare font, so there is no next/font/google
   loader for it — the four weights are vendored into src/fonts/ and loaded
   locally. This is what removes api.fontshare.com from the critical path.

   There is NO 600. Satoshi ships 300/400/500/700/900; the page asks for
   font-semibold in a handful of places (all mobile-menu links) and CSS font
   matching resolves those up to 700. Invisible at that size — HANDOFF §5.23.
   Do not invent a 600 by faking it here. */
const satoshi = localFont({
  variable: "--font-satoshi",
  display: "swap",
  src: [
    { path: "../fonts/Satoshi-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Satoshi-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Satoshi-700.woff2", weight: "700", style: "normal" },
    { path: "../fonts/Satoshi-900.woff2", weight: "900", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "Interloid — Senior product engineering",
  description:
    "Interloid is a senior product-engineering team. Defined problems to deployed software, in your accounts, on your repos.",
};

/* Resolved before first paint so a stored dark preference does not flash light.
   HANDOFF §5.19: script.js owns the `.dark` class and the WebGL stage only
   OBSERVES it — two owners is a race. This inline script is the earliest of
   those writers and must stay ahead of the stylesheet.

   suppressHydrationWarning on <html> is required, not optional: this script
   mutates the class attribute before React hydrates, so the server markup and
   the client DOM legitimately disagree on it. */
const themeScript = `(function(){try{var t=localStorage.getItem("interloid-theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} ${satoshi.variable}`}
    >
      {/* No manual <meta charset> or <meta name="viewport"> here: Next injects
          both automatically, and adding them by hand produced TWO of each in
          the rendered HTML (verified with curl). The values that were added
          are exactly Next's defaults, so nothing is lost by removing them — if
          non-default viewport values are ever wanted, export a `viewport`
          object from this file rather than writing the tag. */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      {/* `overflow-x-clip`, NOT `overflow-x-hidden` — corrected 2026-09-08.
          `hidden` on either axis makes <body> a SCROLL CONTAINER, and a scroll
          container is where `position: sticky` sticks: every sticky element on
          the site was therefore pinning to a box that never scrolls, i.e. not
          sticking at all. Measured on /services, where the capability panel
          scrolled 2589px off the top of the viewport instead of holding.
          `clip` clips exactly the same overflow without establishing a scroll
          container, so the horizontal-overflow guard is unchanged and sticky
          works. Do not "restore" `overflow-x-hidden`. */}
      <body className="overflow-x-clip bg-background font-sans text-muted-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
