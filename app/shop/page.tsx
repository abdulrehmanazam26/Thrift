import { Catalog } from "@/components/shop/Catalog";
export const metadata = {
  title: "Shop the Vault",
  description:
    "Explore pre-loved clothing by size, condition, color, style, and actual garment measurements.",
  alternates: { canonical: "/shop" },
};
export default function Page() {
  return <Catalog />;
}
