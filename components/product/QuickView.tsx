"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import type { Product } from "@/lib/commerce/types";
import { money } from "@/lib/format";
import { track } from "@/lib/analytics";
import { Modal } from "@/components/ui/Modal";
import { useStore } from "@/components/commerce/StoreProvider";
export function QuickView({
  product: p,
  open,
  onOpenChange,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { add } = useStore();
  useEffect(() => {
    if (open) track("quick_view", { productId: p.id });
  }, [open, p.id]);
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="A CLOSER LOOK">
      <div className="quick-view">
        <div className="quick-image">
          <Image
            src={p.images[0]?.src || "/favicon.svg"}
            alt={p.images[0]?.alt || p.title}
            fill
            sizes="(max-width:600px) 90vw, 40vw"
          />
        </div>
        <div className="quick-info">
          <p className="eyebrow">
            {p.brand} / {p.category}
          </p>
          <h2>{p.title}</h2>
          <p className="price sale-price-wrap">
            <strong className="sale-price">{money(p.price, p.currency)}</strong>
            {p.compareAtPrice && p.compareAtPrice > p.price && (
              <>
                <del className="original-price">
                  {money(p.compareAtPrice, p.currency)}
                </del>
                <small className="sale-badge">50% OFF</small>
              </>
            )}
          </p>
          <p>
            Size {p.sizeLabel} · {p.condition} condition
          </p>
          <p className="muted">{p.conditionNotes}</p>
          <div className="measurement-table">
            {Object.entries(p.measurements).map(([key, value]) => (
              <div key={key}>
                <span>{key}</span>
                <strong>{value} cm</strong>
              </div>
            ))}
          </div>
          <button
            className="button dark"
            disabled={!p.stock}
            onClick={() => {
              onOpenChange(false);
              add(p);
            }}
          >
            {p.stock ? "ADD TO BAG →" : "GONE FROM THE VAULT"}
          </button>
          <Link
            className="text-link"
            onClick={() => onOpenChange(false)}
            href={`/products/${p.handle}`}
          >
            VIEW FULL DETAILS ↗
          </Link>
        </div>
      </div>
    </Modal>
  );
}
