import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getCollections } from "@/lib/commerce/collections";
export const metadata = {
  title: "The Collections",
  alternates: { canonical: "/collections" },
};
export default async function Page() {
  const collections = await getCollections();
  return (
    <section className="section collection-page">
      <p className="eyebrow">A DIFFERENT WAY TO DISCOVER</p>
      <h1>THE EDITS.</h1>
      <p className="muted">A common thread. An individual point of view.</p>
      <div className="editorial-grid">
        {collections.map((c, i) => (
          <Link
            href={`/collections/${c.handle}`}
            className="editorial-card"
            key={c.id}
          >
            <Image
              src={c.image || "/images/campaign.webp"}
              alt={c.title}
              fill
              sizes="(max-width:700px) 100vw, 50vw"
            />
            <div className="editorial-overlay" />
            <span className="editorial-index">
              EDIT / {String(i + 1).padStart(2, "0")}
            </span>
            <div className="editorial-text">
              <p className="eyebrow">
                {c.productIds.length} PIECES IN THIS EDIT
              </p>
              <h3>{c.title.toUpperCase()}</h3>
              <span className="text-link">
                EXPLORE THE EDIT <ArrowUpRight size={20} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
