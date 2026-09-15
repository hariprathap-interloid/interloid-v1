import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScrollGuard from "@/components/SmoothScrollGuard";
import { INDEXABLE, SITE_NAME, SITE_URL } from "@/content/seo";
import { SOCIAL_LINKS } from "@/content/social";

/* Body face. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/* Display face for headings, card titles and labels. */
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

/* Hero H1 only, at weight 900 (`font-hero font-black`). Satoshi is a Fontshare
   font, so it is vendored and loaded locally. */
const satoshi = localFont({
  variable: "--font-satoshi",
  display: "swap",
  src: [{ path: "../fonts/Satoshi-900.woff2", weight: "900", style: "normal" }],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Interloid: Senior product engineering",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Interloid is a senior product-engineering team. Defined problems to deployed software, in your accounts, on your repos.",
  applicationName: SITE_NAME,
  robots: INDEXABLE ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f7f9fc",
};

/* Runs before first paint: marks JS as available (scroll reveals only hide
   content when it is). Light is the default; dark applies only when the
   visitor chose it with the theme toggle, without a flash.
   It mutates <html>'s class before hydration, hence suppressHydrationWarning. */
const themeScript = `(function(){var d=document.documentElement;d.classList.add("js");try{var t=localStorage.getItem("interloid-theme");if(t==="dark")d.classList.add("dark")}catch(e){}})();`;

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  legalName: "Interloid Technologies Private Limited",
  url: SITE_URL,
  email: "connect@interloid.com",
  telephone: "+91 9042032424",
  sameAs: SOCIAL_LINKS.map((s) => s.href),
  address: {
    "@type": "PostalAddress",
    streetAddress: "No. 82/1, First Floor, Jai Marappa Complex, Sri Aishwariyam Nagar, Karattadipalayam",
    addressLocality: "Gobichettipalayam",
    addressRegion: "Tamil Nadu",
    postalCode: "638453",
    addressCountry: "IN",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} ${satoshi.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organization).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      {/* `overflow-x-clip`, not `overflow-x-hidden`: `hidden` makes <body> a
          scroll container, which breaks every `position: sticky` on the site. */}
      <body className="overflow-x-clip bg-background font-sans text-muted-foreground antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-200 focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:font-semibold focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <SmoothScrollGuard />
        {children}
      </body>
    </html>
  );
}
