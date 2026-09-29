"use client";
import Link from "next/link";
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  UserRound,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/components/commerce/StoreProvider";
import { CartDrawer } from "@/components/commerce/CartDrawer";
import { Modal } from "@/components/ui/Modal";
import { filterProducts } from "@/lib/commerce/search";
import { ProductCard } from "@/components/product/ProductCard";
import { track } from "@/lib/analytics";
const links = [
  ["SHOP", "/shop"],
  ["NEW DROP", "/new-drop"],
  ["MEN", "/shop?gender=Men"],
  ["WOMEN", "/shop?gender=Women"],
  ["VINTAGE", "/shop?style=Vintage"],
  ["STREETWEAR", "/shop?style=Streetwear"],
  ["ABOUT", "/about"],
];
export function Header() {
  const { lines, wishlist, setCartOpen, products, mode } = useStore();
  const [menu, setMenu] = useState(false),
    [search, setSearch] = useState(false),
    [query, setQuery] = useState("");
  const router = useRouter();
  const matches = filterProducts(products, { query }).slice(0, 4);
  return (
    <>
      <div className="announcement">
        <span>GOOD CLOTHES. SECOND CHANCES. <i aria-hidden="true">✦</i> CURATED PRE-LOVED.</span>
        <Link href="/new-drop">
          {mode === "local"
            ? "EXPLORE THE PREVIEW"
            : "DISCOVER THE LATEST DROP"}{" "}
          <ArrowUpRight size={12} />
        </Link>
      </div>
      <header className="header">
        <Link className="wordmark" href="/" aria-label="Thrift Vault home">
          <span className="brand-lockup">
            <span className="brand-thrift">THRIFT</span>
            <span className="brand-urdu" lang="ur" dir="rtl">کرو</span>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([label, url]) => (
            <Link href={url} key={label}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-tools">
          <button
            className="icon-button"
            onClick={() => setSearch(true)}
            aria-label="Search the Vault"
          >
            <Search size={21} />
          </button>
          <Link
            className="icon-button desktop-tool"
            href="/account"
            aria-label="Account"
          >
            <UserRound size={20} />
          </Link>
          <Link
            className="icon-button desktop-tool"
            href="/wishlist"
            aria-label={`Wishlist, ${wishlist.length} saved pieces`}
          >
            <Heart size={21} />
            {wishlist.length > 0 && (
              <span className="tool-count">{wishlist.length}</span>
            )}
          </Link>
          <button
            className="bag-button"
            onClick={() => setCartOpen(true)}
            aria-label={`Open bag, ${lines.length} pieces`}
          >
            <ShoppingBag size={20} />
            <span>BAG ({lines.length})</span>
          </button>
          <button
            className="icon-button mobile-menu-trigger"
            onClick={() => setMenu(true)}
            aria-label="Open menu"
          >
            <Menu size={23} />
          </button>
        </div>
      </header>
      <Modal
        open={menu}
        onOpenChange={setMenu}
        title="THRIFT VAULT"
        variant="menu"
      >
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {[
            ...links,
            ["THE ARCHIVE", "/archive"],
            ["SAVED PIECES", "/wishlist"],
            ["ACCOUNT", "/account"],
          ].map(([label, url], i) => (
            <Link key={label} href={url} onClick={() => setMenu(false)}>
              <span className="small">{String(i + 1).padStart(2, "0")}</span>
              {label}
              <ArrowUpRight />
            </Link>
          ))}
        </nav>
        <p className="eyebrow">WEAR WHAT OTHERS WON’T FIND.</p>
      </Modal>
      <Modal
        open={search}
        onOpenChange={setSearch}
        title="WHAT ARE YOU LOOKING FOR?"
        variant="search"
      >
        <form
          className="search-form"
          onSubmit={(e) => {
            e.preventDefault();
            track("search", { query });
            setSearch(false);
            router.push(`/shop?q=${encodeURIComponent(query)}`);
          }}
        >
          <Search size={23} />
          <input
            autoFocus
            aria-label="Search products"
            placeholder="Try denim, black hoodie, vintage…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="icon-button" aria-label="View search results">
            <ArrowRight />
          </button>
        </form>
        <div className="search-results">
          <p className="eyebrow">
            {query
              ? `${filterProducts(products, { query }).length} PIECES FOUND`
              : "A FEW GOOD PLACES TO START"}
          </p>
          {matches.length ? (
            <div
              className="product-grid"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("a")) setSearch(false);
              }}
            >
              {matches.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2>
                NOTHING MATCHED
                <br />
                THAT SEARCH.
              </h2>
              <p>Try a color, category, size, or a simpler phrase.</p>
              <button className="text-link" onClick={() => setQuery("")}>
                CLEAR SEARCH
              </button>
            </div>
          )}
        </div>
      </Modal>
      <CartDrawer />
    </>
  );
}
