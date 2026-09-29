import { Home } from "@/components/home/Home";
import { getProducts } from "@/lib/commerce/products";
import { getCollections } from "@/lib/commerce/collections";
import { commerce } from "@/lib/commerce/provider";
export const metadata = { alternates: { canonical: "/" } };
export default async function Page() {
  const [products, collections] = await Promise.all([
    getProducts(),
    getCollections(),
  ]);
  return (
    <Home
      products={products}
      collections={collections}
      preview={commerce.mode === "local"}
      newsletter={!!process.env.NEWSLETTER_ENDPOINT}
    />
  );
}
