import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "@fontsource/anton/latin-400.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "./globals.css";
import "./brand.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StoreProvider } from "@/components/commerce/StoreProvider";
import { getProducts } from "@/lib/commerce/products";
import { commerce } from "@/lib/commerce/provider";
import { settings } from "@/lib/settings";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  metadataBase: new URL(settings.siteUrl),
  title: {
    default: "THRIFT VAULT — Curated Pre-Loved Fashion",
    template: "%s | THRIFT VAULT",
  },
  description:
    "Discover a considered edit of pre-loved clothing, streetwear, and one-off finds. Clear condition notes. Garment measurements. Your next chapter.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    siteName: "THRIFT VAULT",
    title: "THRIFT VAULT — Old Soul. New Energy.",
    description: "Curated pre-loved fashion. Wear what others won’t find.",
    images: [{ url: "/images/campaign-v2.webp", width: 1122, height: 1402 }],
  },
  twitter: { card: "summary_large_image" },
  robots:
    commerce.mode === "local"
      ? { index: false, follow: false }
      : { index: true, follow: true },
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const products = await getProducts();
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: settings.name,
              url: settings.siteUrl,
            }).replace(/</g, "\\u003c"),
          }}
        />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <StoreProvider products={products} mode={commerce.mode}>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
