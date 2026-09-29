import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { getProductByHandle } from "@/lib/commerce/products";
import { settings } from "@/lib/settings";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getProductByHandle(slug);
  if (!p) return { title: "Piece not found" };
  return {
    title: p.title,
    description: `${p.title}. Size ${p.sizeLabel}, ${p.condition.toLowerCase()} condition. Explore garment measurements and condition notes.`,
    alternates: { canonical: `/products/${p.handle}` },
    openGraph: {
      type: "website",
      title: `${p.title} | THRIFT VAULT`,
      description: p.description,
      url: `/products/${p.handle}`,
      images: p.images.slice(0, 1).map((i) => ({ url: i.src, alt: i.alt })),
    },
    twitter: {
      card: "summary_large_image",
      title: p.title,
      description: p.description,
      images: p.images.slice(0, 1).map((i) => i.src),
    },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getProductByHandle(slug);
  if (!p) notFound();
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: settings.siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Shop",
            item: settings.siteUrl + "/shop",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: p.title,
            item: settings.siteUrl + "/products/" + p.handle,
          },
        ],
      },
      ...(!p.sample
        ? [
            {
              "@type": "Product",
              name: p.title,
              description: p.description,
              image: p.images.map((i) =>
                new URL(i.src, settings.siteUrl).toString(),
              ),
              sku: p.id,
              brand:
                p.brand !== "Unbranded"
                  ? { "@type": "Brand", name: p.brand }
                  : undefined,
              offers: {
                "@type": "Offer",
                price: p.price,
                priceCurrency: p.currency,
                availability:
                  p.stock > 0
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
                itemCondition: "https://schema.org/UsedCondition",
                url: settings.siteUrl + "/products/" + p.handle,
              },
            },
          ]
        : []),
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <ProductDetail product={p} />
    </>
  );
}
