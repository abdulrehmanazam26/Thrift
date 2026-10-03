"use client";
import type { ImageLoaderProps } from "next/image";
// Editorial images have responsive WebP variants; catalog photos retain their originals.
export default function imageLoader({ src, width, quality }: ImageLoaderProps) {
  if (src.startsWith("/api/product-images/")) return `${src}?w=${width}`;
  if (src.startsWith("https://cdn.shopify.com/")) {
    const url = new URL(src);
    url.searchParams.set("width", String(width));
    return url.toString();
  }
  if (src.startsWith("/images/")) {
    if (src.startsWith("/images/products/")) return `${src}?w=${width}`;
    // Newly uploaded/generated campaign images do not have pre-built WebP variants.
    if (src.endsWith(".png")) return `${src}?w=${width}`;
    const name = src
      .split("/")
      .pop()
      ?.replace(/\.[^.]+$/, "");
    const size =
      [160, 320, 480, 640, 960, 1400, 1920].find((w) => w >= width) || 1920;
    return `/images/responsive/${name}-${size}.webp`;
  }
  return `${src}?w=${width}&q=${quality || 80}`;
}
