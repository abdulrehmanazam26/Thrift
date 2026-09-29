import { Catalog } from "@/components/shop/Catalog";
import { getCollections } from "@/lib/commerce/collections";
import Link from "next/link";
export const metadata = {
  title: "New Drop",
  alternates: { canonical: "/new-drop" },
};
export default async function Page() {
  const drop = (await getCollections()).find((c) => c.isDrop);
  return drop ? (
    <Catalog
      title={drop.title.toUpperCase() + "."}
      eyebrow="NEW IN THE VAULT"
      description={drop.description}
      collection={drop.handle}
    />
  ) : (
    <div className="empty-state">
      <h1>THE NEXT CHAPTER.</h1>
      <p>
        A new drop hasn’t been announced yet. Explore what’s already in the
        Vault.
      </p>
      <Link className="button dark" href="/shop">
        EXPLORE ALL PIECES →
      </Link>
    </div>
  );
}
