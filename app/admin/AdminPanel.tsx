"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  Package,
  Plus,
  Search,
  Settings2,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import styles from "./admin.module.css";

type Product = {
  id: string;
  handle: string;
  title: string;
  brand: string;
  description: string;
  category: string;
  gender: string;
  condition: string;
  condition_notes: string;
  size_label: string;
  color: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  images: Array<{ src: string }>;
  is_active: boolean;
};
type Order = {
  id: string;
  order_number: number;
  customer_name: string;
  phone: string;
  email: string | null;
  address_line1: string;
  address_line2: string | null;
  area: string;
  city: string;
  customer_note: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  created_at: string;
  items: Array<{ product_title: string; quantity: number; unit_price: number }>;
};
type Overview = {
  products: Product[];
  orders: Order[];
  settings: { delivery_fee: number; checkout_enabled: boolean };
  stats: { orders: number; delivered_revenue: number; new_orders: number };
};
type ProductForm = {
  id?: string;
  handle: string;
  title: string;
  brand: string;
  description: string;
  category: string;
  gender: string;
  condition: "Premium" | "Like new" | "Excellent" | "Very good" | "Good";
  conditionNotes: string;
  sizeLabel: string;
  color: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  imageUrls: string[];
  isActive: boolean;
};
const emptyProduct: ProductForm = {
  handle: "",
  title: "",
  brand: "",
  description: "",
  category: "Tops",
  gender: "Women",
  condition: "Good",
  conditionNotes: "",
  sizeLabel: "Ask for size",
  color: "See photos",
  price: 0,
  compareAtPrice: null,
  stock: 1,
  imageUrls: [],
  isActive: true,
};
const statuses = [
  "new",
  "confirmed",
  "packed",
  "out_for_delivery",
  "delivered",
  "cancelled",
];
const conditions: ProductForm["condition"][] = [
  "Premium",
  "Like new",
  "Excellent",
  "Very good",
  "Good",
];
const sizes = [
  "Ask for size",
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
  "One Size",
  "26",
  "28",
  "30",
  "32",
  "34",
  "36",
  "UK 6",
  "UK 8",
  "UK 10",
  "UK 12",
  "UK 14",
  "UK 16",
];
const categories = [
  "Jackets",
  "Tops",
  "T-Shirts",
  "Shirts",
  "Hoodies",
  "Knitwear",
  "Jeans",
  "Trousers",
  "Dresses",
  "Skirts",
  "Sets",
  "Accessories",
  "Clothing",
  "Other",
];
const rupees = (amount: number) =>
  `Rs ${Number(amount || 0).toLocaleString("en-PK")}`;

type AdminTab =
  | "overview"
  | "orders"
  | "products"
  | "customers"
  | "analytics"
  | "settings";

const navigation: Array<{ tab: AdminTab; label: string; icon: typeof LayoutDashboard }> = [
  { tab: "overview", label: "Home", icon: LayoutDashboard },
  { tab: "orders", label: "Orders", icon: ClipboardList },
  { tab: "products", label: "Products", icon: Package },
  { tab: "customers", label: "Customers", icon: Users },
  { tab: "analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminPanel({
  authenticated,
  demoMode,
}: {
  authenticated: boolean;
  demoMode: boolean;
}) {
  const [signedIn, setSignedIn] = useState(authenticated);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [data, setData] = useState<Overview | null>(null);
  const [tab, setTab] = useState<AdminTab>("overview");
  const [editor, setEditor] = useState<ProductForm | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [orderQuery, setOrderQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [productQuery, setProductQuery] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const reload = useCallback(async () => {
    const response = await fetch("/api/admin/overview", { cache: "no-store" });
    if (response.status === 401) {
      setSignedIn(false);
      setData(null);
      return;
    }
    if (!response.ok) throw new Error("Could not load admin data.");
    setData(await response.json());
  }, []);
  useEffect(() => {
    if (signedIn) void reload().catch((e) => setNotice(e.message));
  }, [signedIn, reload]);
  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setPassword("");
      setSignedIn(true);
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    setSignedIn(false);
    setData(null);
  }
  async function updateOrder(id: string, status: string) {
    if (demoMode) return;
    setBusy(true);
    setNotice("");
    try {
      const r = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      await reload();
      setNotice("Order status updated.");
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;
    setBusy(true);
    setNotice("");
    try {
      const r = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editor),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setEditor(null);
      await reload();
      setNotice("Product saved.");
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function updateCheckout(checkoutEnabled: boolean) {
    if (demoMode) return;
    setBusy(true);
    setNotice("");
    try {
      const r = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutEnabled }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      await reload();
      setNotice(checkoutEnabled ? "Checkout opened." : "Checkout paused.");
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function editProduct(p: Product) {
    setEditor({
      id: p.id,
      handle: p.handle,
      title: p.title,
      brand: p.brand,
      description: p.description,
      category: p.category,
      gender: p.gender,
      condition: p.condition as ProductForm["condition"],
      conditionNotes: p.condition_notes,
      sizeLabel: p.size_label,
      color: p.color,
      price: p.price,
      compareAtPrice: p.compare_at_price,
      stock: p.stock,
      imageUrls: p.images.map((x) => x.src),
      isActive: p.is_active,
    });
    setTab("products");
  }
  const visibleOrders = (data?.orders || []).filter((order) => {
    if (orderFilter !== "all" && order.status !== orderFilter) return false;
    const query = orderQuery.trim().toLowerCase();
    return (
      !query ||
      [order.order_number, order.customer_name, order.phone, order.area].some(
        (value) => String(value).toLowerCase().includes(query),
      )
    );
  });
  const visibleProducts = (data?.products || []).filter((product) => {
    const query = productQuery.trim().toLowerCase();
    const status = !product.is_active
      ? "draft"
      : product.stock === 0
        ? "sold"
        : "live";
    return (
      (productFilter === "all" || productFilter === status) &&
      (!query ||
        [product.title, product.brand, product.category, product.size_label]
          .join(" ")
          .toLowerCase()
          .includes(query))
    );
  });
  const productStatus = (product: Product) =>
    !product.is_active ? "Draft" : product.stock === 0 ? "Sold out" : "Live";
  function exportOrders() {
    const escapeCell = (value: unknown) => {
      const text = String(value ?? "").replace(/^[\s]*[=+\-@]/, "'$&");
      return `"${text.replaceAll('"', '""')}"`;
    };
    const header = [
      "Order",
      "Date",
      "Status",
      "Customer",
      "Phone",
      "Email",
      "Address",
      "Area",
      "Items",
      "Subtotal",
      "Delivery",
      "Total",
    ];
    const rows = visibleOrders.map((order) => [
      order.order_number,
      order.created_at,
      order.status,
      order.customer_name,
      order.phone,
      order.email,
      [order.address_line1, order.address_line2].filter(Boolean).join(", "),
      order.area,
      order.items
        .map((item) => `${item.product_title} x ${item.quantity}`)
        .join("; "),
      order.subtotal,
      order.delivery_fee,
      order.total,
    ]);
    const csv =
      "\uFEFF" +
      [header, ...rows]
        .map((row) => row.map(escapeCell).join(","))
        .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `thrift-karo-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  if (!signedIn)
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <p className={styles.kicker}>PRIVATE STORE ACCESS</p>
          <h1>
            Welcome
            <br />
            <em>back.</em>
          </h1>
          <p>
            Manage your orders, one-of-a-kind pieces and store availability.
          </p>
          <form onSubmit={signIn}>
            <label>
              Admin ID
              <input
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {notice && (
              <p role="alert" className={styles.error}>
                {notice}
              </p>
            )}
            <button disabled={busy}>
              {busy ? "SIGNING IN…" : "SIGN IN →"}
            </button>
          </form>
          <Link href="/">← Back to the store</Link>
        </div>
      </div>
    );
  return (
    <div className={styles.panel}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand}>
          THRIFT <em>کرو</em>
          <span>STORE CONTROL</span>
        </Link>
        <p className={styles.navLabel}>MANAGE STORE</p>
        <nav aria-label="Admin navigation">
          {navigation.map(({ tab: itemTab, label, icon: Icon }) => (
              <button
                key={itemTab}
                className={tab === itemTab ? styles.active : ""}
                onClick={() => {
                  setTab(itemTab);
                  setEditor(null);
                }}
              >
                <Icon size={16} />
                {label}
                {itemTab === "orders" && data?.stats.new_orders ? (
                  <b>{data.stats.new_orders}</b>
                ) : null}
              </button>
            ))}
        </nav>
        <div className={styles.sidebarBottom}>
          <button
            className={tab === "settings" ? styles.active : ""}
            onClick={() => {
              setTab("settings");
              setEditor(null);
            }}
          >
            <Settings2 size={16} /> SETTINGS
          </button>
          <Link href="/" target="_blank">
            VIEW STORE ↗
          </Link>
          <button onClick={signOut}>SIGN OUT</button>
        </div>
      </aside>
      <div className={styles.main}>
        <div className={styles.topbar}>
          <label>
            <Search size={17} />
            <input
              placeholder="Search products, brands or categories"
              value={productQuery}
              onFocus={() => setTab("products")}
              onChange={(event) => {
                setProductQuery(event.target.value);
                setTab("products");
              }}
            />
          </label>
          <div className={styles.ownerBadge}>
            <span>TK</span>
            <div><strong>Thrift Karo</strong><small>Store owner</small></div>
          </div>
        </div>
        {demoMode && (
          <div className={styles.demoBanner} role="status">
            <strong>LOCAL TEST MODE</strong>
            <span>
              Products and photos you add here will appear in this local store.
              Connect the database before publishing on Vercel.
            </span>
          </div>
        )}
        <div className={styles.top}>
          <div>
            <p className={styles.kicker}>PRIVATE DASHBOARD</p>
            <h1>
              {tab === "overview"
                ? "The big picture."
                : tab === "orders"
                  ? "Orders."
                  : tab === "products"
                    ? "The edit."
                    : tab === "customers"
                      ? "Customers."
                      : tab === "analytics"
                        ? "Store performance."
                        : "Store settings."}
            </h1>
          </div>
          <span className={styles.live}>
            ●{" "}
            {data?.settings.checkout_enabled
              ? "CHECKOUT OPEN"
              : "CHECKOUT PAUSED"}
          </span>
        </div>
        {notice && (
          <p className={styles.message} role="status">
            {notice}
          </p>
        )}
        {!data ? (
          <p>Loading your studio…</p>
        ) : (
          <>
            {tab === "overview" && (
              <>
                <div className={styles.cards}>
                  <div>
                    <span>ORDERS</span>
                    <strong>{data.stats.orders}</strong>
                    <small>All active orders</small>
                  </div>
                  <div>
                    <span>TO CONFIRM</span>
                    <strong>{data.stats.new_orders}</strong>
                    <small>New customer requests</small>
                  </div>
                  <div>
                    <span>DELIVERED SALES</span>
                    <strong>{rupees(data.stats.delivered_revenue)}</strong>
                    <small>Completed COD orders</small>
                  </div>
                  <div>
                    <span>LIVE PIECES</span>
                    <strong>
                      {
                        data.products.filter((p) => p.is_active && p.stock > 0)
                          .length
                      }
                    </strong>
                    <small>Available now</small>
                  </div>
                </div>
                <div className={styles.welcome}>
                  <p className={styles.kicker}>TODAY’S FOCUS</p>
                  <h2>
                    Every piece deserves
                    <br />a good next chapter.
                  </h2>
                  <p>
                    Review new orders, keep stock accurate, and update condition
                    notes before selling.
                  </p>
                  <button onClick={() => setTab("orders")}>
                    VIEW ORDERS ↗
                  </button>
                </div>
              </>
            )}
            {tab === "orders" && (
              <>
                <div className={styles.actionRow}>
                  <input
                    aria-label="Search orders"
                    placeholder="Search order, name, phone, area"
                    value={orderQuery}
                    onChange={(event) => setOrderQuery(event.target.value)}
                  />
                  <select
                    aria-label="Filter order status"
                    value={orderFilter}
                    onChange={(event) => setOrderFilter(event.target.value)}
                  >
                    <option value="all">All statuses</option>
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={exportOrders}
                    disabled={visibleOrders.length === 0}
                  >
                    EXPORT CSV
                  </button>
                </div>
                <div className={styles.list}>
                  {visibleOrders.length === 0 ? (
                    <div className={styles.empty}>
                      No orders yet. New COD orders will appear here.
                    </div>
                  ) : (
                    visibleOrders.map((o) => (
                      <article key={o.id} className={styles.order}>
                        <div className={styles.orderTop}>
                          <div>
                            <strong>#{o.order_number}</strong>
                            <span>
                              {new Date(o.created_at).toLocaleString("en-PK")}
                            </span>
                          </div>
                          <select
                            aria-label={`Status for order ${o.order_number}`}
                            value={o.status}
                            disabled={busy}
                            onChange={(e) =>
                              void updateOrder(o.id, e.target.value)
                            }
                          >
                            {statuses.map((s) => (
                              <option key={s} value={s}>
                                {s.replaceAll("_", " ")}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className={styles.orderBody}>
                          <div>
                            <h3>{o.customer_name}</h3>
                            <p>
                              {o.phone}
                              {o.email ? ` · ${o.email}` : ""}
                            </p>
                            <p>
                              {o.address_line1}
                              {o.address_line2
                                ? `, ${o.address_line2}`
                                : ""}, {o.area}, Karachi
                            </p>
                            {o.customer_note && (
                              <p>
                                <em>Note: {o.customer_note}</em>
                              </p>
                            )}
                          </div>
                          <div className={styles.orderItems}>
                            {o.items.map((item, i) => (
                              <p key={i}>
                                {item.product_title} × {item.quantity}{" "}
                                <strong>
                                  {rupees(item.unit_price * item.quantity)}
                                </strong>
                              </p>
                            ))}
                            <p>
                              Delivery <strong>{rupees(o.delivery_fee)}</strong>
                            </p>
                            <p className={styles.orderTotal}>
                              COD TOTAL <strong>{rupees(o.total)}</strong>
                            </p>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </>
            )}
            {tab === "products" && (
              <>
                <div className={styles.inventoryHeader}>
                  <div>
                    <h2>Products</h2>
                    <p>Manage your inventory, pricing and availability.</p>
                  </div>
                  <button onClick={() => setEditor({ ...emptyProduct })}>
                    <Plus size={16} /> ADD PRODUCT
                  </button>
                </div>
                {editor ? (
                  <form className={styles.editor} onSubmit={saveProduct}>
                    <div className={styles.editorHead}>
                      <h2>{editor.id ? "Edit piece" : "New piece"}</h2>
                      <button type="button" onClick={() => setEditor(null)}>
                        CLOSE ×
                      </button>
                    </div>
                    <div className={styles.editorGrid}>
                      <label>
                        Product name
                        <input
                          required
                          value={editor.title}
                          onChange={(e) =>
                            setEditor({
                              ...editor,
                              title: e.target.value,
                              handle: editor.id
                                ? editor.handle
                                : e.target.value
                                    .toLowerCase()
                                    .trim()
                                    .replace(/[^a-z0-9]+/g, "-")
                                    .replace(/^-|-$/g, ""),
                            })
                          }
                        />
                      </label>
                      <label className={styles.wide}>
                        Description
                        <textarea
                          rows={3}
                          placeholder="Describe the piece, fabric, fit and any useful details."
                          value={editor.description}
                          onChange={(e) =>
                            setEditor({
                              ...editor,
                              description: e.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        Brand
                        <input
                          value={editor.brand}
                          onChange={(e) =>
                            setEditor({ ...editor, brand: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Category
                        <select
                          value={editor.category}
                          onChange={(e) =>
                            setEditor({ ...editor, category: e.target.value })
                          }
                        >
                          {categories.map((category) => (
                            <option key={category}>{category}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Sale price · Rs
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          required
                          value={editor.price || ""}
                          onChange={(e) =>
                            setEditor({
                              ...editor,
                              price: Number(e.target.value.replace(/\D/g, "")),
                            })
                          }
                        />
                      </label>
                      <label>
                        Original price · Rs
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={editor.compareAtPrice ?? ""}
                          onChange={(e) =>
                            setEditor({
                              ...editor,
                              compareAtPrice: e.target.value.replace(/\D/g, "")
                                ? Number(e.target.value.replace(/\D/g, ""))
                                : null,
                            })
                          }
                        />
                      </label>
                      <label>
                        Stock
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          required
                          value={editor.stock}
                          onChange={(e) =>
                            setEditor({
                              ...editor,
                              stock: Number(e.target.value.replace(/\D/g, "")),
                            })
                          }
                        />
                      </label>
                      <fieldset
                        className={`${styles.conditionField} ${styles.wide}`}
                      >
                        <legend>Condition</legend>
                        <div className={styles.conditionChoices}>
                          {conditions.map((condition) => (
                            <label
                              key={condition}
                              className={
                                editor.condition === condition
                                  ? styles.selectedCondition
                                  : ""
                              }
                            >
                              <input
                                type="radio"
                                name="condition"
                                value={condition}
                                checked={editor.condition === condition}
                                onChange={() =>
                                  setEditor({ ...editor, condition })
                                }
                              />
                              {condition}
                            </label>
                          ))}
                        </div>
                      </fieldset>
                      <fieldset className={`${styles.sizeField} ${styles.wide}`}>
                        <legend>Size</legend>
                        <div className={styles.sizeChoices}>
                          {sizes.map((size) => (
                            <button
                              type="button"
                              key={size}
                              className={editor.sizeLabel === size ? styles.selectedSize : ""}
                              onClick={() => setEditor({ ...editor, sizeLabel: size })}
                            >
                              {size}
                            </button>
                          ))}
                          <button
                            type="button"
                            className={!sizes.includes(editor.sizeLabel) ? styles.selectedSize : ""}
                            onClick={() => setEditor({ ...editor, sizeLabel: "" })}
                          >
                            Other
                          </button>
                        </div>
                        {!sizes.includes(editor.sizeLabel) && (
                          <input
                            required
                            aria-label="Custom size"
                            placeholder="Enter exact label size"
                            value={editor.sizeLabel}
                            onChange={(e) =>
                              setEditor({ ...editor, sizeLabel: e.target.value })
                            }
                          />
                        )}
                      </fieldset>
                      <label>
                        Color
                        <input
                          value={editor.color}
                          onChange={(e) =>
                            setEditor({ ...editor, color: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Gender
                        <select
                          value={editor.gender}
                          onChange={(e) =>
                            setEditor({ ...editor, gender: e.target.value })
                          }
                        >
                          {["Women", "Men", "Unisex"].map((x) => (
                            <option key={x}>{x}</option>
                          ))}
                        </select>
                      </label>
                      <div className={`${styles.wide} ${styles.photosField}`}>
                        <p>PRODUCT PHOTOS</p>
                        <PhotoUploader
                          onUploaded={(url) =>
                            setEditor((current) =>
                              current
                                ? {
                                    ...current,
                                    imageUrls: [
                                      ...current.imageUrls,
                                      url,
                                    ].slice(0, 10),
                                  }
                                : current,
                            )
                          }
                        />
                        {editor.imageUrls.length > 0 && (
                          <div className={styles.photoGrid}>
                            {editor.imageUrls.map((src, index) => (
                              <div key={`${src}-${index}`}>
                                <Image
                                  src={src}
                                  alt={`Product photo ${index + 1}`}
                                  width={100}
                                  height={112}
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditor({
                                      ...editor,
                                      imageUrls: editor.imageUrls.filter(
                                        (_, i) => i !== index,
                                      ),
                                    })
                                  }
                                >
                                  Remove ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <details className={styles.advancedImages}>
                          <summary>Use photo URLs instead (advanced)</summary>
                          <textarea
                            rows={3}
                            aria-label="Photo URLs, one per line"
                            value={editor.imageUrls.join("\n")}
                            onChange={(e) =>
                              setEditor({
                                ...editor,
                                imageUrls: e.target.value
                                  .split("\n")
                                  .map((x) => x.trim())
                                  .filter(Boolean),
                              })
                            }
                            placeholder="/images/products/photo.png or https://…"
                          />
                        </details>
                      </div>
                      <label className={styles.wide}>
                        Condition notes
                        <textarea
                          rows={3}
                          value={editor.conditionNotes}
                          onChange={(e) =>
                            setEditor({
                              ...editor,
                              conditionNotes: e.target.value,
                            })
                          }
                        />
                      </label>
                      <label className={styles.check}>
                        <input
                          type="checkbox"
                          checked={editor.isActive}
                          onChange={(e) =>
                            setEditor({ ...editor, isActive: e.target.checked })
                          }
                        />{" "}
                        Visible in store
                      </label>
                    </div>
                    <div className={styles.editorActions}>
                      <button type="button" onClick={() => setEditor(null)}>
                        CANCEL
                      </button>
                      <button type="submit" disabled={busy}>
                        {busy ? "SAVING…" : "SAVE PIECE ↗"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className={styles.inventoryStats}>
                      <div><span>TOTAL PRODUCTS</span><strong>{data.products.length}</strong><small>All pieces in your store</small></div>
                      <div><span>LIVE NOW</span><strong>{data.products.filter((p) => p.is_active && p.stock > 0).length}</strong><small>Available to customers</small></div>
                      <div><span>SOLD OUT</span><strong>{data.products.filter((p) => p.stock === 0).length}</strong><small>Keep for archive or restock</small></div>
                      <div><span>AVERAGE PRICE</span><strong>{rupees(Math.round(data.products.reduce((total, p) => total + p.price, 0) / Math.max(data.products.length, 1)))}</strong><small>Across all listed pieces</small></div>
                    </div>
                    <div className={styles.productToolbar}>
                      <label>
                        <Search size={16} />
                        <input
                          aria-label="Search products"
                          placeholder="Search product, brand or size"
                          value={productQuery}
                          onChange={(event) => setProductQuery(event.target.value)}
                        />
                      </label>
                      <div className={styles.productFilters}>
                        {[["all", "All"], ["live", "Live"], ["draft", "Drafts"], ["sold", "Sold out"]].map(([value, label]) => (
                          <button
                            type="button"
                            key={value}
                            className={productFilter === value ? styles.selectedFilter : ""}
                            onClick={() => setProductFilter(value)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <button className={styles.filterButton} type="button" aria-label="Product filters">
                        <SlidersHorizontal size={16} /> FILTERS
                      </button>
                    </div>
                    {selectedProductIds.length > 0 && (
                      <div className={styles.bulkBar}>
                        <strong>{selectedProductIds.length} selected</strong>
                        <button type="button" onClick={() => setSelectedProductIds([])}>CLEAR SELECTION</button>
                      </div>
                    )}
                    <div className={styles.productTable}>
                      <div className={styles.productTableHead}>
                        <input
                          aria-label="Select all visible products"
                          type="checkbox"
                          checked={visibleProducts.length > 0 && visibleProducts.every((product) => selectedProductIds.includes(product.id))}
                          onChange={(event) =>
                            setSelectedProductIds(event.target.checked ? visibleProducts.map((product) => product.id) : [])
                          }
                        />
                        <span>PRODUCT</span><span>DETAILS</span><span>PRICE</span><span>STOCK</span><span>STATUS</span><span />
                      </div>
                      {visibleProducts.length === 0 ? (
                        <div className={styles.empty}>No products match these filters.</div>
                      ) : visibleProducts.map((p) => {
                        const status = productStatus(p);
                        return <article key={p.id}>
                          <input
                            aria-label={`Select ${p.title}`}
                            type="checkbox"
                            checked={selectedProductIds.includes(p.id)}
                            onChange={(event) => setSelectedProductIds((current) => event.target.checked ? [...current, p.id] : current.filter((id) => id !== p.id))}
                          />
                          <div className={styles.productTitleCell}>
                            <div className={styles.productThumb}>{p.images[0]?.src && <Image src={p.images[0].src} alt="" width={46} height={54} />}</div>
                            <div><strong>{p.title}</strong><small>{p.brand || "Unbranded"}</small></div>
                          </div>
                          <span className={styles.productDetail}>{p.category}<small>{p.size_label} · {p.condition}</small></span>
                          <span className={styles.productPrice}>{rupees(p.price)}{p.compare_at_price ? <small>{rupees(p.compare_at_price)}</small> : null}</span>
                          <span className={styles.productStock}>{p.stock > 0 ? `${p.stock} piece${p.stock === 1 ? "" : "s"}` : "0 pieces"}</span>
                          <span className={`${styles.statusPill} ${status === "Live" ? styles.livePill : status === "Sold out" ? styles.soldPill : styles.draftPill}`}>{status}</span>
                          <button className={styles.editButton} onClick={() => editProduct(p)}>EDIT</button>
                        </article>;
                      })}
                    </div>
                  </>
                )}
              </>
            )}
            {tab === "customers" && (
              <div className={styles.insightCard}>
                <p className={styles.kicker}>CUSTOMER DIRECTORY</p>
                <h2>Customers appear here after their first COD order.</h2>
                <p>Names, phone numbers and order history are kept together so you can confirm delivery quickly and recognise returning customers.</p>
                <div className={styles.empty}>No customer orders yet.</div>
              </div>
            )}
            {tab === "analytics" && (
              <div className={styles.analyticsGrid}>
                <div><span>DELIVERED SALES</span><strong>{rupees(data.stats.delivered_revenue)}</strong><small>From completed COD orders</small></div>
                <div><span>ACTIVE PRODUCTS</span><strong>{data.products.filter((p) => p.is_active && p.stock > 0).length}</strong><small>Currently visible in store</small></div>
                <div><span>ORDERS TO CONFIRM</span><strong>{data.stats.new_orders}</strong><small>Action needed from you</small></div>
                <div className={styles.insightCard}><p className={styles.kicker}>STORE INSIGHT</p><h2>Keep your next edit moving.</h2><p>Use the Products screen to see what is live, sold out or still a draft. Order performance will appear here as sales start.</p></div>
              </div>
            )}
            {tab === "settings" && (
              <div className={styles.settingsCard}>
                <p className={styles.kicker}>CHECKOUT CONTROL</p>
                <h2>Cash on delivery.</h2>
                <p>
                  Karachi only. Flat Rs {data.settings.delivery_fee} delivery.
                  No online payment or added tax.
                </p>
                <div className={styles.settingLine}>
                  <div>
                    <strong>Accept new orders</strong>
                    <small>Pause checkout instantly when you need to.</small>
                  </div>
                  <button
                    disabled={busy || demoMode}
                    onClick={() =>
                      void updateCheckout(!data.settings.checkout_enabled)
                    }
                  >
                    {data.settings.checkout_enabled
                      ? "PAUSE CHECKOUT"
                      : "OPEN CHECKOUT"}
                  </button>
                </div>
                <p className={styles.caution}>
                  Changing product availability or checkout status affects the
                  live store immediately. Order history stays available.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PhotoUploader({
  onUploaded,
}: {
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  async function upload(file: File) {
    if (
      file.size > 3 * 1024 * 1024 ||
      !["image/png", "image/jpeg", "image/webp"].includes(file.type)
    ) {
      setMessage("Choose a PNG, JPEG or WebP photo under 3 MB.");
      return;
    }
    setUploading(true);
    setMessage("");
    try {
      const form = new FormData();
      form.set("image", file);
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Could not upload photo.");
      onUploaded(data.url);
      setMessage("Photo added. Save the product to publish it.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not upload photo.",
      );
    } finally {
      setUploading(false);
    }
  }
  return (
    <div className={styles.uploader}>
      <label className={styles.uploadZone}>
        <span className={styles.uploadSymbol}>+</span>
        <strong>{uploading ? "UPLOADING…" : "CHOOSE A PHOTO"}</strong>
        <span>PNG, JPEG or WebP · maximum 3 MB</span>
        <input
          aria-label="Upload product photo"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
            event.target.value = "";
          }}
        />
      </label>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
