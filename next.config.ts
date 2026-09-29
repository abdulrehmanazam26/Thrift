import type { NextConfig } from "next";
const config: NextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    deviceSizes: [320, 480, 640, 960, 1400, 1920],
    imageSizes: [160],
    remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com" }],
  },
  poweredByHeader: false,
};
export default config;
