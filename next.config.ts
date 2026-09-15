import path from "node:path";

import type { NextConfig } from "next";

const indexable = process.env.SITE_INDEXABLE === "true";

const nextConfig: NextConfig = {
  turbopack: { root: path.resolve(__dirname) },

  /* /careers/apply posts a CV of up to 5 MB; Server Actions cap bodies at 1 MB
     by default. */
  experimental: {
    serverActions: { bodySizeLimit: "6mb" },
  },

  /* Every non-launch deployment (design review, previews) stays out of search
     results, including non-HTML assets. */
  async headers() {
    if (indexable) return [];
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },

  /* The enquiry page was first published at /content. */
  async redirects() {
    return [{ source: "/content", destination: "/contact", permanent: true }];
  },
};

export default nextConfig;
