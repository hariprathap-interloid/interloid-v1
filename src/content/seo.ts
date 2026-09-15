/* Deployment-wide SEO switches.

   NEXT_PUBLIC_SITE_URL  the public origin, used for canonical URLs, Open Graph
                         and the sitemap. Falls back to localhost in dev.
   SITE_INDEXABLE        "true" only on the public launch. Anything else
                         serves noindex meta, an X-Robots-Tag header and a
                         disallow-all robots.txt. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const INDEXABLE = process.env.SITE_INDEXABLE === "true";

export const SITE_NAME = "Interloid";

/** Page metadata with a canonical URL and a matching Open Graph block. The
    Open Graph image comes from app/opengraph-image.tsx. */
export function pageMeta(path: string, title: string, description: string) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: path,
      siteName: SITE_NAME,
      type: "website" as const,
      locale: "en_IN",
      images: "/opengraph-image",
    },
    twitter: { card: "summary_large_image" as const, images: "/opengraph-image" },
  };
}
