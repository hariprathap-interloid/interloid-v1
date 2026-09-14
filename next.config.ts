import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* DIFFERENT FROM next-js/ ON PURPOSE - do not "fix" this to match it.
     `next-js` pins the Turbopack root to its own folder, because the repo root
     above it carries a second package-lock.json (the Playwright tooling for
     prototype3/) that Turbopack would otherwise adopt as the workspace root.

     This folder cannot do the same: its `node_modules` is a SYMLINK to
     `next-js/node_modules`, so with the root pinned here the link points
     outside it and the build dies with "Symlink [project]/node_modules is
     invalid, it points out of the filesystem root". The root has to be the
     shared parent of this app and the folder its node_modules points into. */
  turbopack: { root: path.resolve(__dirname, "..") },

  /* /careers/apply posts a CV of up to 5 MB (content/apply.ts). Server
     Actions cap a request body at 1 MB by default, which would reject most
     CVs before the action runs; 6 MB leaves room for the other fields and
     the multipart overhead. */
  experimental: {
    serverActions: { bodySizeLimit: "6mb" },
  },

  /* /content → /contact, 2026-09-11. The enquiry page was first built at
     /content — a slip for "contact" in the original brief — and renamed to
     what the menu calls it. These keep any link or bookmark to the old
     address working (308, permanent; the query string carries over). The
     lab moved with it. */
  async redirects() {
    return [
      { source: "/content", destination: "/contact", permanent: true },
      { source: "/content-lab/:path*", destination: "/contact-lab/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
