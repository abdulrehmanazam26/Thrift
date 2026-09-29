"use client";
import type { ImageLoaderProps } from "next/image";
// Local responsive WebP files are pre-generated; Shopify handles its own CDN transformations.
export default function imageLoader({ src, width, quality }: ImageLoaderProps) {
  if (src.startsWith("https://cdn.shopify.com/")) {
    const url = new URL(src);
    url.searchParams.set("width", String(width));
    return url.toString();
  }
  if (src.startsWith("/images/")) {
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
