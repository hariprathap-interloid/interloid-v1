/* Official Interloid profiles, shown in the footer and listed as `sameAs` in
   the Organization structured data.

   Icons are single-colour paths drawn with `currentColor` and `evenodd`: they
   rest in the footer's monochrome link colour, and on hover take `color` over
   a white disc, where the cut-outs show white and the marks read as the real
   brand logos. */
export const SOCIAL_LINKS = [
  {
    href: "https://www.linkedin.com/company/interloid-technologies",
    label: "LinkedIn",
    color: "#0A66C2",
    viewBox: "0 0 100 100",
    path: "M99.922 86.121c0 7.621-6.18 13.8-13.8 13.8H14.358c-7.62 0-13.8-6.179-13.8-13.8V14.36c0-7.62 6.18-13.8 13.8-13.8H86.12c7.621 0 13.8 6.18 13.8 13.8ZM17.121 36.441h13.8V83.36h-13.8Zm6.86-5.52h-.079c-4.117 0-6.78-3.07-6.78-6.905 0-3.914 2.745-6.895 6.937-6.895 4.199 0 6.785 2.98 6.863 6.895 0 3.832-2.664 6.906-6.942 6.906M83.358 83.36h-13.8V58.246c0-6.066-3.38-10.207-8.809-10.207-4.145 0-6.383 2.793-7.473 5.492-.394.969-.277 3.64-.277 4.989v24.84H39.2V36.44H53v7.22c1.988-3.083 5.105-7.22 13.078-7.22 9.875 0 17.277 6.207 17.277 20.075Z",
  },
  {
    href: "https://x.com/InterloidTech",
    label: "X (Twitter)",
    color: "#000000",
    viewBox: "0 0 1200 1227",
    path: "M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284zM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854z",
  },
  {
    href: "https://www.youtube.com/@InterloidTechnologies",
    label: "YouTube",
    color: "#FF0000",
    viewBox: "0 0 256 180",
    path: "M250.346 28.075A32.18 32.18 0 0 0 227.69 5.418C207.824 0 127.87 0 127.87 0S47.912.164 28.046 5.582A32.18 32.18 0 0 0 5.39 28.24c-6.009 35.298-8.34 89.084.165 122.97a32.18 32.18 0 0 0 22.656 22.657c19.866 5.418 99.822 5.418 99.822 5.418s79.955 0 99.82-5.418a32.18 32.18 0 0 0 22.657-22.657c6.338-35.348 8.291-89.1-.164-123.134ZM102.421 128.06l66.328-38.418-66.328-38.418z",
  },
] as const;
