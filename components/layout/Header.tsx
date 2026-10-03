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
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/components/commerce/StoreProvider";
import { CartDrawer } from "@/components/commerce/CartDrawer";
import { Modal } from "@/components/ui/Modal";
import { filterProducts } from "@/lib/commerce/search";
import { ProductCard } from "@/components/product/ProductCard";
import { track } from "@/lib/analytics";
const categoryMenus = [
  {
    label: "MEN",
    href: "/shop?gender=Men",
    items: [
      ["SHOP ALL MEN", "/shop?gender=Men"],
      ["JACKETS & OUTERWEAR", "/shop?gender=Men&category=Jackets"],
      ["TOPS & TEES", "/shop?gender=Men&category=Tops"],
      ["SHIRTS", "/shop?gender=Men&category=Shirts"],
      ["JEANS & TROUSERS", "/shop?gender=Men&category=Trousers"],
      ["HOODIES & SWEATS", "/shop?gender=Men&category=Hoodies"],
      ["KNITWEAR", "/shop?gender=Men&category=Knitwear"],
    ],
  },
  {
    label: "WOMEN",
    href: "/shop?gender=Women",
    items: [
      ["SHOP ALL WOMEN", "/shop?gender=Women"],
      ["JACKETS & COATS", "/shop?gender=Women&category=Jackets"],
      ["TOPS & TEES", "/shop?gender=Women&category=Tops"],
      ["SHIRTS & BLOUSES", "/shop?gender=Women&category=Shirts"],
      ["DRESSES & SKIRTS", "/shop?gender=Women&category=Dresses"],
      ["JEANS & TROUSERS", "/shop?gender=Women&category=Trousers"],
      ["KNITWEAR", "/shop?gender=Women&category=Knitwear"],
    ],
  },
] as const;

const links = [
  ["HOME", "/"],
  ["VINTAGE", "/shop?style=Vintage"],
  ["ABOUT", "/about"],
] as const;
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
        <Link href="/shop">
          {mode === "local"
            ? "EXPLORE THE PREVIEW"
            : "EXPLORE THE LATEST FINDS"}{" "}
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
          <Link href="/">HOME</Link>
          {categoryMenus.map((menu) => (
            <details className="nav-dropdown" key={menu.label}>
              <summary>{menu.label} <ChevronDown size={13} aria-hidden="true" /></summary>
              <div className="nav-dropdown-panel">
                <Link className="nav-dropdown-title" href={menu.href}>{menu.label}&apos;S EDIT <ArrowUpRight size={14} /></Link>
                {menu.items.map(([label, url]) => <Link href={url} key={label}>{label}</Link>)}
              </div>
            </details>
          ))}
          {links.slice(1).map(([label, url]) => <Link href={url} key={label}>{label}</Link>)}
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
            ["HOME", "/"],
            ...categoryMenus.flatMap((menu) => [
              [menu.label, menu.href],
              ...menu.items.map(([label, url]) => [`↳ ${label}`, url]),
            ]),
            ["VINTAGE", "/shop?style=Vintage"],
            ["ABOUT", "/about"],
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
