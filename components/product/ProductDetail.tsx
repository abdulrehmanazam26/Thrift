"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ArrowUpRight,
  Share2,
  Plus,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/commerce/types";
import { useStore } from "@/components/commerce/StoreProvider";
import { Measurements } from "./Measurements";
import { Modal } from "@/components/ui/Modal";
import { ProductCard } from "./ProductCard";
import { money } from "@/lib/format";
import { settings } from "@/lib/settings";
import { track } from "@/lib/analytics";
export function ProductDetail({ product: initial }: { product: Product }) {
  const router = useRouter();
  const { products, add, wishlist, toggleWish, notify } = useStore();
  const p = products.find((x) => x.id === initial.id) || {
    ...initial,
    stock: 0,
  };
  const [active, setActive] = useState(0),
    [zoom, setZoom] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const gallery = useRef<HTMLDivElement>(null);
  useEffect(() => {
    track("product_view", { productId: p.id });
  }, [p.id]);
  const select = (index: number) => {
    setActive(index);
    gallery.current?.scrollTo({
      left: index * gallery.current.clientWidth,
      behavior: "smooth",
    });
  };
  const related = products
    .filter((x) => x.id !== p.id && x.stock > 0)
    .sort(
      (a, b) =>
        Number(b.category === p.category) - Number(a.category === p.category) ||
        Number(b.sizeLabel === p.sizeLabel) -
          Number(a.sizeLabel === p.sizeLabel),
    )
    .slice(0, 4);
  const buyNow = async () => {
    setBusy(true);
    setError("");
    try {
      track("checkout", { productId: p.id });
      router.push(`/checkout?buy=${encodeURIComponent(p.id)}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <section className="product-page section">
        <div className="breadcrumbs">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/shop">The Vault</Link>
          <span>/</span>
          <span>{p.title}</span>
        </div>
        <div className="product-detail-layout">
          <div className="gallery-column">
            <div
              className="gallery-main"
              ref={gallery}
              onScroll={(e) => {
                const el = e.currentTarget;
                setActive(Math.round(el.scrollLeft / el.clientWidth));
              }}
            >
              {p.images.map((im, i) => (
                <button
                  key={i}
                  className="gallery-slide"
                  onClick={() => {
                    setActive(i);
                    setZoom(true);
                  }}
                  aria-label={`Zoom ${im.label}`}
                >
                  <Image
                    src={im.src}
                    alt={im.alt}
                    fill
                    priority={i === 0}
                    sizes="(max-width:700px) 100vw, 55vw"
                    className={i > 0 && p.sample ? "gallery-detail-crop" : ""}
                  />
                  <span className="zoom-hint">
                    <Plus size={18} /> ZOOM IN
                  </span>
                </button>
              ))}
            </div>
            <div className="gallery-caption">
              <span>
                {String(active + 1).padStart(2, "0")} /{" "}
                {String(p.images.length).padStart(2, "0")} —{" "}
                {p.images[active]?.label}
              </span>
              <div>
                <button
                  className="icon-button"
                  aria-label="Previous photo"
                  disabled={active === 0}
                  onClick={() => select(active - 1)}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  className="icon-button"
                  aria-label="Next photo"
                  disabled={active === p.images.length - 1}
                  onClick={() => select(active + 1)}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            <div className="gallery-thumbs">
              {p.images.map((im, i) => (
                <button
                  key={i}
                  className={i === active ? "active" : ""}
                  onClick={() => select(i)}
                  aria-label={`Show ${im.label}`}
                  aria-pressed={i === active}
                >
                  <Image
                    src={im.src}
                    alt={im.label}
                    width={85}
                    height={100}
                    className={i > 0 && p.sample ? "gallery-detail-crop" : ""}
                  />
                </button>
              ))}
            </div>
            {p.sample && (
              <p className="sample-image-note">
                Illustrative preview photography. The detail view is a crop of
                the same image. Real item, label, and defect photos will
                accompany live inventory.
              </p>
            )}
          </div>
          <div className="product-info">
            <p className="eyebrow">
              {p.brand} / {p.category}
            </p>
            <div className="detail-title">
              <h1>{p.title}</h1>
              <button
                className={`wish-button ${wishlist.includes(p.id) ? "saved" : ""}`}
                onClick={() => toggleWish(p.id)}
                aria-label={
                  wishlist.includes(p.id)
                    ? "Remove from wishlist"
                    : "Save to wishlist"
                }
                aria-pressed={wishlist.includes(p.id)}
              >
                <Heart size={23} />
              </button>
            </div>
            <p className="detail-price sale-price-wrap">
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
            <p className={`stock-note ${!p.stock ? "unavailable" : ""}`}>
              <span />
              {p.stock === 0
                ? "GONE FROM THE VAULT."
                : p.stock === 1
                  ? "ONE PIECE. ONLY THIS ONE."
                  : "AVAILABLE IN THE VAULT."}
            </p>
            <div className="product-facts">
              <div>
                <span>LABEL SIZE</span>
                <strong>{p.sizeLabel}</strong>
              </div>
              <div>
                <span>COLOR</span>
                <strong>{p.color}</strong>
              </div>
              <div>
                <span>CONDITION</span>
                <strong>{p.condition}</strong>
              </div>
            </div>
            {p.sample && (
              <p className="preview-note">
                Preview piece — sample price, measurements, and grading. Not
                currently offered for sale.
              </p>
            )}
            {p.stock > 0 ? (
              <div className="purchase-actions">
                <button className="button dark" onClick={() => add(p)}>
                  ADD TO BAG <ArrowUpRight size={20} />
                </button>
                <button
                  className="button light-button"
                  onClick={buyNow}
                  disabled={busy}
                >
                  {busy ? "CHECKING…" : "BUY NOW"} <ArrowUpRight size={20} />
                </button>
                <p className="small muted">
                  A piece in your bag is not reserved. Availability is checked
                  at checkout.
                </p>
              </div>
            ) : (
              <Link
                className="button dark"
                href={`/shop?category=${encodeURIComponent(p.category)}`}
                onClick={() =>
                  track("sold_product_interest", { productId: p.id })
                }
              >
                FIND SOMETHING SIMILAR <ArrowUpRight size={18} />
              </Link>
            )}
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <div className="detail-section">
              <h3>A LITTLE ABOUT THIS PIECE</h3>
              <p>{p.description}</p>
              {p.material && (
                <p className="small muted">
                  Material: {p.material}
                  {p.sample ? " (sample detail)" : ""}
                </p>
              )}
            </div>
            <div className="detail-section">
              <div className="subheading">
                <h3>CONDITION NOTES</h3>
                <Link href="/help/condition" className="text-link">
                  THE GUIDE <ArrowUpRight size={13} />
                </Link>
              </div>
              <p>{p.conditionNotes}</p>
              {p.defects.length > 0 && (
                <ul className="defect-list">
                  {p.defects.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="detail-section">
              <Measurements measurements={p.measurements} />
            </div>
            <details className="product-accordion">
              <summary>
                DELIVERY & RETURNS <Plus size={15} />
              </summary>
              <p>{settings.policies.shipping}</p>
              <p>{settings.policies.returns}</p>
              <Link className="text-link" href="/help/shipping">
                READ THE DETAILS <ArrowUpRight size={14} />
              </Link>
            </details>
            <div className="share-actions">
              <button
                className="text-link"
                onClick={async () => {
                  try {
                    if (navigator.share)
                      await navigator.share({
                        title: p.title,
                        text: `${p.title} | THRIFT VAULT`,
                        url: window.location.href,
                      });
                    else {
                      await navigator.clipboard.writeText(window.location.href);
                      notify("Product link copied.");
                    }
                  } catch (e) {
                    if ((e as Error).name !== "AbortError")
                      notify("Please copy the link from your address bar.");
                  }
                }}
              >
                <Share2 size={15} /> SHARE THIS FIND
              </button>
              {/^\d{8,15}$/.test(settings.whatsapp) && (
                <a
                  className="text-link"
                  href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(`Hi Thrift Vault, I'm interested in: ${p.title}\nSize: ${p.sizeLabel}\nPrice: ${money(p.price, p.currency)}\n${settings.siteUrl}/products/${p.handle}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("whatsapp", { productId: p.id })}
                >
                  <MessageCircle size={15} /> ASK ABOUT THIS PIECE
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="section related-products">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THERE’S MORE WHERE THAT CAME FROM</p>
            <h2>KEEP EXPLORING.</h2>
          </div>
          <Link className="text-link" href="/shop">
            THE FULL EDIT <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="product-grid">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
      <div className="sticky-purchase">
        <div>
          <span>{p.title}</span>
          <strong>{money(p.price, p.currency)}</strong>
        </div>
        <button
          className="button dark"
          disabled={!p.stock}
          onClick={() => add(p)}
        >
          {p.stock ? "ADD TO BAG" : "GONE."} <ArrowUpRight size={17} />
        </button>
      </div>
      <Modal
        open={zoom}
        onOpenChange={setZoom}
        title={p.images[active]?.label || p.title}
        variant="zoom"
      >
        <div className="zoom-image">
          <Image
            src={p.images[active]?.src || "/favicon.svg"}
            alt={p.images[active]?.alt || p.title}
            fill
            sizes="90vw"
            className={active > 0 && p.sample ? "gallery-detail-crop" : ""}
          />
        </div>
        <div className="zoom-controls">
          <button
            className="icon-button"
            disabled={active === 0}
            onClick={() => setActive(active - 1)}
            aria-label="Previous zoom photo"
          >
            <ChevronLeft />
          </button>
          <span>
            {active + 1} / {p.images.length}
          </span>
          <button
            className="icon-button"
            disabled={active === p.images.length - 1}
            onClick={() => setActive(active + 1)}
            aria-label="Next zoom photo"
          >
            <ChevronRight />
          </button>
        </div>
      </Modal>
    </>
  );
}
