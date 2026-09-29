import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/commerce/products";
import { getCollections } from "@/lib/commerce/collections";
import { settings } from "@/lib/settings";
import { commerce } from "@/lib/commerce/provider";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (commerce.mode === "local") return [];
  const [products, collections] = await Promise.all([
    getProducts(),
    getCollections(),
  ]);
  return [
    "",
    "/shop",
    "/new-drop",
    "/archive",
    "/about",
    "/collections",
    "/contact",
    ...[
      "sizing",
      "condition",
      "shipping",
      "returns",
      "faq",
      "privacy",
      "terms",
    ].map((x) => "/help/" + x),
    ...products.map((p) => "/products/" + p.handle),
    ...collections.map((c) => "/collections/" + c.handle),
  ].map((path) => ({ url: settings.siteUrl + path }));
}
