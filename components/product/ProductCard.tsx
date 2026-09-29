"use client";
import Image from "next/image";
import Link from "next/link";
import { Heart, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/commerce/types";
import { money } from "@/lib/format";
import { useStore } from "@/components/commerce/StoreProvider";
import { QuickView } from "./QuickView";
export function ProductCard({ product: initial }: { product: Product }) {
  const { wishlist, toggleWish, products } = useStore();
  const p = products.find((item) => item.id === initial.id) || {
    ...initial,
    stock: 0,
  };
  const [quick, setQuick] = useState(false);
  return (
    <article className="product-card">
      <div className="product-image">
        <Link href={`/products/${p.handle}`} aria-label={`View ${p.title}`}>
          <Image
            src={p.images[0]?.src || "/favicon.svg"}
            alt={p.images[0]?.alt || p.title}
            fill
            sizes="(max-width:600px) 47vw, (max-width:1000px) 30vw, 24vw"
          />
          {p.images[1] && (
            <Image
              className={`secondary ${p.sample ? "detail-crop" : ""}`}
              src={p.images[1].src}
              alt={p.images[1].alt}
              fill
              sizes="(max-width:600px) 47vw, 25vw"
            />
          )}
        </Link>
        <span className={`badge ${p.stock === 0 ? "sold" : ""}`}>
          {p.stock === 0
            ? "GONE."
            : p.stock === 1
              ? "1 OF 1"
              : p.condition.toUpperCase()}
        </span>
        <button
          className={`wish-button ${wishlist.includes(p.id) ? "saved" : ""}`}
          onClick={() => toggleWish(p.id)}
          aria-label={`${wishlist.includes(p.id) ? "Remove" : "Save"} ${p.title}${wishlist.includes(p.id) ? " from" : " to"} wishlist`}
          aria-pressed={wishlist.includes(p.id)}
        >
          <Heart size={18} />
        </button>
        <button className="quick-button" onClick={() => setQuick(true)}>
          QUICK VIEW <ArrowUpRight size={17} />
        </button>
      </div>
      <div className="product-meta">
        <span>{p.category}</span>
        <span>
          {p.sizeLabel} / {p.condition}
        </span>
      </div>
      <Link className="product-name" href={`/products/${p.handle}`}>
        {p.title}
      </Link>
      <div className="product-bottom">
        <span className="sale-price-wrap">
          <strong className="sale-price">{money(p.price, p.currency)}</strong>
          {p.compareAtPrice && p.compareAtPrice > p.price && (
            <>
              <del className="original-price">
                {money(p.compareAtPrice, p.currency)}
              </del>
              <small className="sale-badge">50% OFF</small>
            </>
          )}
        </span>
        <span>
          {p.brand !== "Unbranded"
            ? p.brand
            : p.sample
              ? "PREVIEW PIECE"
              : "UNBRANDED"}
        </span>
      </div>
      <QuickView product={p} open={quick} onOpenChange={setQuick} />
    </article>
  );
}
