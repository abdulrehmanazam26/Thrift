"use client";
import Link from "next/link";
import { Heart, ArrowUpRight } from "lucide-react";
import { useStore } from "./StoreProvider";
import { ProductCard } from "@/components/product/ProductCard";
export function Wishlist() {
  const { wishlist, products, toggleWish } = useStore();
  const saved = products.filter((p) => wishlist.includes(p.id)),
    missing = wishlist.filter((id) => !products.some((p) => p.id === id));
  return (
    <section className="section wishlist-page">
      <p className="eyebrow">THE PIECES THAT CAUGHT YOUR EYE</p>
      <h1>ON YOUR RADAR.</h1>
      <p className="muted">
        Saved on this device. A saved piece isn’t a reserved piece.
      </p>
      {saved.length || missing.length ? (
        <>
          <div className="product-grid">
            {saved.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {missing.map((id) => (
            <div className="preview-note" key={id}>
              A saved piece is no longer listed.{" "}
              <button className="text-link" onClick={() => toggleWish(id)}>
                REMOVE
              </button>
            </div>
          ))}
        </>
      ) : (
        <div className="empty-state">
          <Heart size={40} strokeWidth={1} />
          <h2>NOTHING SAVED YET.</h2>
          <p>Tap the heart on a piece to keep it close.</p>
          <Link className="button dark" href="/shop">
            EXPLORE THE VAULT <ArrowUpRight size={18} />
          </Link>
        </div>
      )}
    </section>
  );
}
