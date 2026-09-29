import { Catalog } from "@/components/shop/Catalog";
export const metadata = {
  title: "The Sold Archive",
  alternates: { canonical: "/archive" },
};
export default function Page() {
  return (
    <Catalog
      title="GONE. NOT FORGOTTEN."
      eyebrow="THE ARCHIVE"
      description="A look back at pieces that have found their next chapter. These items are no longer available."
      archive
    />
  );
}
