"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { useStore } from "./StoreProvider";
import { Modal } from "@/components/ui/Modal";
import { money } from "@/lib/format";
import { track } from "@/lib/analytics";
export function CartDrawer() {
  const {
    products,
    lines,
    remove,
    setQuantity,
    mode,
    cartOpen,
    setCartOpen,
    refresh,
  } = useStore();
  const [pending, setPending] = useState(false),
    [error, setError] = useState("");
  const items = lines.map((l) => ({
    ...l,
    product: products.find((p) => p.id === l.productId),
  }));
  const invalid = items.some(
    (l) => !l.product || l.quantity > (l.product?.stock || 0),
  );
  const total = items.reduce(
    (sum, l) => sum + (l.product?.price || 0) * l.quantity,
    0,
  );
  const currencies = new Set(
    items.flatMap((l) => (l.product ? [l.product.currency] : [])),
  );
  const checkout = async () => {
    setPending(true);
    setError("");
    try {
      await refresh();
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      const url = new URL(result.checkoutUrl);
      if (url.protocol !== "https:")
        throw new Error("Invalid checkout address.");
      track("checkout", { itemCount: lines.length });
      window.location.assign(url.toString());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  };
  return (
    <Modal
      open={cartOpen}
      onOpenChange={setCartOpen}
      title={`YOUR BAG (${lines.length})`}
      variant="drawer"
    >
      {!lines.length ? (
        <div className="empty-state">
          <ShoppingBag size={38} strokeWidth={1} />
          <h2>
            YOUR VAULT
            <br />
            IS EMPTY.
          </h2>
          <p>There’s a piece out there with your name on it.</p>
          <Link
            className="button dark"
            href="/shop"
            onClick={() => setCartOpen(false)}
          >
            FIND A PIECE <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {items.map(({ product: p, ...line }) => (
              <div className="cart-item" key={line.productId}>
                {p && (
                  <Link
                    onClick={() => setCartOpen(false)}
                    href={`/products/${p.handle}`}
                  >
                    <Image
                      src={p.images[0]?.src || "/favicon.svg"}
                      alt={p.title}
                      width={100}
                      height={130}
                    />
                  </Link>
                )}
                <div>
                  <h3>{p?.title || "No longer listed"}</h3>
                  <p className="small muted">
                    {p
                      ? `Size ${p.sizeLabel} · ${p.condition}`
                      : "Please remove this item."}
                  </p>
                  {p && <strong>{money(p.price, p.currency)}</strong>}
                  {p && p.stock > 1 && (
                    <label className="quantity">
                      Quantity{" "}
                      <input
                        type="number"
                        min="1"
                        max={p.stock}
                        value={line.quantity}
                        onChange={(e) => {
                          const q = Number(e.target.value);
                          if (Number.isInteger(q) && q > 0 && q <= p.stock)
                            setQuantity(p.id, q);
                        }}
                      />
                    </label>
                  )}
                  {p && p.stock < line.quantity && (
                    <p className="error">Gone from the Vault. Please remove.</p>
                  )}
                  <button
                    className="remove-link"
                    aria-label={`Remove ${p?.title || "unavailable item"} from bag`}
                    onClick={() => remove(line.productId)}
                  >
                    <Trash2 size={13} /> REMOVE
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <div className="subtotal">
              <span>SUBTOTAL</span>
              <strong>{money(total, items[0]?.product?.currency)}</strong>
            </div>
            <p className="small muted">
              Shipping is calculated at checkout. Pieces in your bag are not
              reserved.
            </p>
            {mode === "local" && (
              <p className="preview-note">
                Store preview — these pieces aren’t for sale yet.
              </p>
            )}
            <button
              className="button dark"
              onClick={checkout}
              disabled={pending || invalid || currencies.size > 1}
            >
              {pending ? "CHECKING AVAILABILITY…" : "CHECKOUT"}
              <ArrowRight size={18} />
            </button>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button className="text-link" onClick={() => setCartOpen(false)}>
              CONTINUE EXPLORING
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
