import type { MetadataRoute } from "next";
import { settings } from "@/lib/settings";
import { commerce } from "@/lib/commerce/provider";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      ...(commerce.mode === "local"
        ? { disallow: "/" }
        : { allow: "/", disallow: ["/api/", "/account", "/wishlist"] }),
    },
    ...(commerce.mode === "shopify"
      ? { sitemap: settings.siteUrl + "/sitemap.xml" }
      : {}),
  };
}
