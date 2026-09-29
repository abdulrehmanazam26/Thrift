"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { CartInput, Product } from "@/lib/commerce/types";
import { addToCart } from "@/lib/commerce/cart";
import { track } from "@/lib/analytics";
type Store = {
  products: Product[];
  mode: "local" | "shopify";
  lines: CartInput[];
  wishlist: string[];
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  add: (p: Product) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, q: number) => void;
  toggleWish: (id: string) => void;
  refresh: () => Promise<void>;
  notify: (s: string) => void;
};
const StoreContext = createContext<Store | null>(null);
export function StoreProvider({
  children,
  products: initialProducts,
  mode,
}: {
  children: React.ReactNode;
  products: Product[];
  mode: "local" | "shopify";
}) {
  const [products, setProducts] = useState(initialProducts),
    [lines, setLines] = useState<CartInput[]>([]),
    [wishlist, setWishlist] = useState<string[]>([]),
    [cartOpen, setCartOpen] = useState(false),
    [ready, setReady] = useState(false),
    [notice, setNotice] = useState("");
  const notify = useCallback((message: string) => setNotice(message), []);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("tv-bag") || "[]");
      const wishes = JSON.parse(localStorage.getItem("tv-wishlist") || "[]");
      if (Array.isArray(saved))
        setLines(
          saved
            .filter(
              (l) =>
                l &&
                typeof l.productId === "string" &&
                Number.isInteger(l.quantity) &&
                l.quantity > 0,
            )
            .slice(0, 50),
        );
      if (Array.isArray(wishes))
        setWishlist(wishes.filter((x) => typeof x === "string"));
    } catch {}
    setReady(true);
    document.documentElement.dataset.storeReady = "true";
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem("tv-bag", JSON.stringify(lines));
        localStorage.setItem("tv-wishlist", JSON.stringify(wishlist));
      } catch {
        notify("Your browser could not save this bag. Keep this tab open.");
      }
  }, [lines, wishlist, ready, notify]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);
  const refresh = useCallback(async () => {
    const response = await fetch("/api/commerce", { cache: "no-store" });
    if (!response.ok)
      throw new Error("Could not refresh availability. Please try again.");
    const result = await response.json();
    setProducts(result.products);
  }, []);
  useEffect(() => {
    const onFocus = () => {
      void refresh().catch(() => {});
    };
    window.addEventListener("focus", onFocus);
    const timer = setInterval(onFocus, 60000);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(timer);
    };
  }, [refresh]);
  const add = (product: Product) => {
    const currentProduct = products.find((item) => item.id === product.id);
    if (!currentProduct || currentProduct.stock < 1) {
      notify("This piece has gone from the Vault.");
      return;
    }
    try {
      setLines((current) => addToCart(current, currentProduct));
      setCartOpen(true);
      track("add_to_cart", { productId: product.id });
      void refresh().catch(() =>
        notify("Availability will be checked again at checkout."),
      );
    } catch (e) {
      notify((e as Error).message);
    }
  };
  return (
    <StoreContext.Provider
      value={{
        products,
        mode,
        lines,
        wishlist,
        cartOpen,
        setCartOpen,
        add,
        remove: (id) =>
          setLines((current) => current.filter((l) => l.productId !== id)),
        setQuantity: (id, q) =>
          setLines((current) =>
            current.map((l) =>
              l.productId === id ? { ...l, quantity: q } : l,
            ),
          ),
        toggleWish: (id) => {
          setWishlist((current) =>
            current.includes(id)
              ? current.filter((x) => x !== id)
              : [...current, id],
          );
          track("wishlist", { productId: id });
        },
        refresh,
        notify,
      }}
    >
      {children}
      <div
        className={`toast ${notice ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {notice}
      </div>
    </StoreContext.Provider>
  );
}
export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("StoreProvider is missing");
  return store;
}
