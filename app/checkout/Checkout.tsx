"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useStore } from "@/components/commerce/StoreProvider";
import { money } from "@/lib/format";
import styles from "./checkout.module.css";

const deliveryFee = 250;
export function Checkout({
  buyId,
  checkoutOpen,
}: {
  buyId?: string;
  checkoutOpen: boolean;
}) {
  const router = useRouter();
  const { products, lines, remove, refresh } = useStore();
  const selected = buyId ? [{ productId: buyId, quantity: 1 }] : lines;
  const items = selected.map((line) => ({
    ...line,
    product: products.find((p) => p.id === line.productId),
  }));
  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0,
  );
  const unavailable = items.some(
    (item) => !item.product || item.product.stock < item.quantity,
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    area: "",
    customerNote: "",
  });
  const keyRef = useRef<string | null>(null);
  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!selected.length || unavailable) {
      setError("A piece is no longer available. Please update your bag.");
      return;
    }
    setPending(true);
    try {
      await refresh();
      keyRef.current ||= crypto.randomUUID();
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          city: "Karachi",
          lines: selected,
          idempotencyKey: keyRef.current,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Could not place your order.");
      selected.forEach((item) => remove(item.productId));
      router.push(`/order/${result.id}`);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not place your order.",
      );
      setPending(false);
    }
  }
  return (
    <div className={styles.page}>
      <div className={styles.topline}>
        <Link href="/shop">← CONTINUE SHOPPING</Link>
        <span>THRIFT KARO / SECURE CHECKOUT</span>
      </div>
      <div className={styles.intro}>
        <p>YOUR NEXT CHAPTER STARTS HERE</p>
        <h1>
          Almost
          <br />
          <em>yours.</em>
        </h1>
        <span>One-of-a-kind finds. A simpler way to shop.</span>
      </div>
      {!checkoutOpen && (
        <p className={styles.error} role="status">
          Orders are temporarily paused. You can browse the edit, but checkout
          is not accepting orders yet.
        </p>
      )}
      <div className={styles.grid}>
        <form onSubmit={submit} className={styles.form}>
          <div className={styles.sectionHeading}>
            <span>01</span>
            <div>
              <h2>Delivery details</h2>
              <p>We deliver across Karachi.</p>
            </div>
          </div>
          <div className={styles.fields}>
            <label className={styles.full}>
              Full name{" "}
              <input
                required
                autoComplete="name"
                value={form.customerName}
                onChange={(e) => update("customerName", e.target.value)}
                minLength={2}
                placeholder="Your full name"
              />
            </label>
            <label>
              Phone number{" "}
              <input
                required
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="03XX XXXXXXX"
              />
            </label>
            <label>
              Email <span>(optional)</span>
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label className={styles.full}>
              Street address{" "}
              <input
                required
                autoComplete="street-address"
                value={form.addressLine1}
                onChange={(e) => update("addressLine1", e.target.value)}
                minLength={8}
                placeholder="House / apartment, street and block"
              />
            </label>
            <label className={styles.full}>
              Landmark or extra details <span>(optional)</span>
              <input
                value={form.addressLine2}
                onChange={(e) => update("addressLine2", e.target.value)}
                placeholder="Helpful delivery directions"
              />
            </label>
            <label>
              Area{" "}
              <input
                required
                value={form.area}
                onChange={(e) => update("area", e.target.value)}
                placeholder="e.g. Clifton, Gulshan"
              />
            </label>
            <label>
              City <input value="Karachi" readOnly aria-label="City: Karachi" />
            </label>
          </div>
          <div className={styles.sectionHeading}>
            <span>02</span>
            <div>
              <h2>Payment</h2>
              <p>No online payment required.</p>
            </div>
          </div>
          <div className={styles.cod}>
            <span className={styles.radio} />{" "}
            <div>
              <strong>Cash on delivery</strong>
              <small>Pay the rider when your order arrives in Karachi.</small>
            </div>
            <strong>COD</strong>
          </div>
          <label className={styles.note}>
            Order note <span>(optional)</span>
            <textarea
              rows={3}
              value={form.customerNote}
              onChange={(e) => update("customerNote", e.target.value)}
              placeholder="Anything we should know?"
            />
          </label>
          <p className={styles.notice}>
            Your order is confirmed when we contact you. We only use these
            details to fulfil your order. No tax or online payment is charged
            here.
          </p>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className={styles.place}
            disabled={
              pending || !checkoutOpen || !selected.length || unavailable
            }
          >
            {pending
              ? "PLACING ORDER…"
              : `PLACE ORDER · ${money(subtotal + (selected.length ? deliveryFee : 0), "PKR")}`}{" "}
            <span>↗</span>
          </button>
        </form>
        <aside className={styles.summary}>
          <div className={styles.summaryTop}>
            <p>THE FINAL EDIT</p>
            <h2>
              Your order
              <span>{selected.length.toString().padStart(2, "0")}</span>
            </h2>
          </div>
          {!selected.length ? (
            <div className={styles.empty}>
              <p>Your bag is empty.</p>
              <Link href="/shop">EXPLORE THE EDIT ↗</Link>
            </div>
          ) : (
            <div className={styles.items}>
              {items.map(({ product, productId, quantity }) => (
                <div className={styles.item} key={productId}>
                  <div className={styles.photo}>
                    {product?.images[0] && (
                      <Image
                        src={product.images[0].src}
                        alt={product.title}
                        fill
                        sizes="90px"
                      />
                    )}
                  </div>
                  <div>
                    <strong>{product?.title || "Unavailable piece"}</strong>
                    <small>
                      {product?.condition} · Qty {quantity}
                    </small>
                    <span>
                      {product ? money(product.price * quantity, "PKR") : "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className={styles.totals}>
            <div>
              <span>Subtotal</span>
              <strong>{money(subtotal, "PKR")}</strong>
            </div>
            <div>
              <span>Karachi delivery</span>
              <strong>{money(selected.length ? deliveryFee : 0, "PKR")}</strong>
            </div>
            <div className={styles.grand}>
              <span>Total · Pay on delivery</span>
              <strong>
                {money(subtotal + (selected.length ? deliveryFee : 0), "PKR")}
              </strong>
            </div>
          </div>
          <p className={styles.assurance}>
            ONE-OF-A-KIND PIECES <span>✦</span> NO HIDDEN CHARGES <span>✦</span>{" "}
            KARACHI COD
          </p>
        </aside>
      </div>
    </div>
  );
}
