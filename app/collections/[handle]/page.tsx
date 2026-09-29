import { notFound } from "next/navigation";
import { getCollections } from "@/lib/commerce/collections";
import { Catalog } from "@/components/shop/Catalog";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const c = (await getCollections()).find((c) => c.handle === handle);
  return {
    title: c?.title || "Collection not found",
    description: c?.description,
    alternates: { canonical: `/collections/${handle}` },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const c = (await getCollections()).find((c) => c.handle === handle);
  if (!c) notFound();
  return (
    <Catalog
      title={c.title.toUpperCase() + "."}
      eyebrow="THE CURATED COLLECTIONS"
      description={c.description}
      collection={c.handle}
    />
  );
}
