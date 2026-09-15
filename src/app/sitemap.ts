import type { MetadataRoute } from "next";
import { SITE_URL } from "@/content/seo";

const ROUTES = ["", "/services", "/why-choose-us", "/about", "/careers", "/careers/apply", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
