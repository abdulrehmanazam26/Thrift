"use client";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, SlidersHorizontal, X, Search } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/components/commerce/StoreProvider";
import { ProductCard } from "@/components/product/ProductCard";
import { Modal } from "@/components/ui/Modal";
import { filterProducts, type Filters } from "@/lib/commerce/search";
import { track } from "@/lib/analytics";
export function Catalog({
  title = "THE VAULT.",
  eyebrow = "FIND SOMETHING THAT FEELS LIKE YOU",
  description = "A considered edit. A different kind of wardrobe.",
  collection,
  archive = false,
}: {
  title?: string;
  eyebrow?: string;
  description?: string;
  collection?: string;
  archive?: boolean;
}) {
  const { products, mode } = useStore(),
    params = useSearchParams(),
    pathname = usePathname(),
    router = useRouter();
  const [mobile, setMobile] = useState(false),
    [visible, setVisible] = useState(12),
    [searchDraft, setSearchDraft] = useState(params.get("q") || "");
  const source = useMemo(
    () =>
      products.filter(
        (p) =>
          (!collection || p.collection.includes(collection)) &&
          (!archive || p.stock === 0),
      ),
    [products, collection, archive],
  );
  const filters: Filters = {
    category: params.get("category") || "",
    gender: params.get("gender") || "",
    brand: params.get("brand") || "",
    size: params.get("size") || "",
    condition: params.get("condition") || "",
    color: params.get("color") || "",
    style: params.get("style") || "",
    availability: archive ? "sold" : params.get("availability") || "",
    maxPrice: Number(params.get("maxPrice")) || undefined,
    query: params.get("q") || "",
    sort: params.get("sort") || "newest",
  };
  const result = filterProducts(source, filters);
  const selected = [...params.entries()].filter(
    ([key, value]) => key !== "sort" && value,
  );
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setVisible(12);
    router.replace(`${pathname}${next.size ? "?" + next.toString() : ""}`, {
      scroll: false,
    });
    track(key === "q" ? "search" : "filter", { key, value });
  };
  const clear = () => {
    setSearchDraft("");
    setVisible(12);
    router.replace(pathname, { scroll: false });
  };
  const options = [
    {
      key: "category",
      label: "Category",
      values: [...new Set(source.map((p) => p.category))],
    },
    { key: "gender", label: "Gender", values: ["Men", "Women", "Unisex"] },
    {
      key: "brand",
      label: "Brand",
      values: [...new Set(source.map((p) => p.brand))],
    },
    {
      key: "size",
      label: "Size",
      values: [...new Set(source.map((p) => p.sizeLabel))],
    },
    {
      key: "condition",
      label: "Condition",
      values: ["Like new", "Excellent", "Very good", "Good"],
    },
    {
      key: "color",
      label: "Color",
      values: [...new Set(source.map((p) => p.color))],
    },
    {
      key: "style",
      label: "Style",
      values: [...new Set(source.flatMap((p) => p.style))],
    },
  ];
  const controls = (prefix: string) => (
    <div className="filter-controls">
      {options.map((option) => (
        <label key={option.key} htmlFor={`${prefix}-${option.key}`}>
          <span>{option.label}</span>
          <select
            id={`${prefix}-${option.key}`}
            value={params.get(option.key) || ""}
            onChange={(e) => update(option.key, e.target.value)}
          >
            <option value="">
              All{" "}
              {option.label === "Category"
                ? "categories"
                : option.label.toLowerCase() + "s"}
            </option>
            {option.values.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
      ))}
      {!archive && (
        <label htmlFor={`${prefix}-availability`}>
          <span>Availability</span>
          <select
            id={`${prefix}-availability`}
            value={filters.availability}
            onChange={(e) => update("availability", e.target.value)}
          >
            <option value="">All pieces</option>
            <option value="available">Available</option>
            <option value="sold">Sold archive</option>
          </select>
        </label>
      )}
      <label htmlFor={`${prefix}-price`}>
        <span>Maximum price ({source[0]?.currency || "PKR"})</span>
        <input
          id={`${prefix}-price`}
          type="number"
          min="0"
          step="100"
          placeholder="Any price"
          value={params.get("maxPrice") || ""}
          onChange={(e) => update("maxPrice", e.target.value)}
        />
      </label>
      {prefix === "mobile" && (
        <label htmlFor="mobile-sort">
          <span>Sort by</span>
          <select
            id="mobile-sort"
            value={filters.sort}
            onChange={(e) => update("sort", e.target.value)}
          >
            <option value="newest">Newest / recently added</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </label>
      )}
    </div>
  );
  return (
    <section className="catalog section">
      <div className="breadcrumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>{archive ? "Archive" : collection ? "Collection" : "Shop"}</span>
      </div>
      <div className="catalog-intro">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {mode === "local" && (
        <p className="catalog-disclosure">
          THE PREVIEW EDIT — Sample pieces, prices & photographs. Orders aren’t
          open yet.
        </p>
      )}
      <div className="catalog-tabs">
        <Link
          className={!filters.gender && !filters.style ? "active" : ""}
          href={pathname}
        >
          ALL PIECES
        </Link>
        <button
          className={filters.gender === "Men" ? "active" : ""}
          onClick={() => update("gender", "Men")}
        >
          MEN
        </button>
        <button
          className={filters.gender === "Women" ? "active" : ""}
          onClick={() => update("gender", "Women")}
        >
          WOMEN
        </button>
        <button
          className={filters.style === "Vintage" ? "active" : ""}
          onClick={() => update("style", "Vintage")}
        >
          VINTAGE
        </button>
        <button
          className={filters.style === "Streetwear" ? "active" : ""}
          onClick={() => update("style", "Streetwear")}
        >
          STREETWEAR
        </button>
      </div>
      <div className="catalog-toolbar">
        <span>
          {result.length} {result.length === 1 ? "PIECE" : "PIECES"}
        </span>
        <button
          className="filter-mobile-trigger"
          onClick={() => setMobile(true)}
        >
          <SlidersHorizontal size={16} /> FILTER & SORT{" "}
          {selected.length ? `(${selected.length})` : ""}
        </button>
        <label className="desktop-sort" htmlFor="catalog-sort">
          SORT BY{" "}
          <select
            id="catalog-sort"
            value={filters.sort}
            onChange={(e) => update("sort", e.target.value)}
          >
            <option value="newest">Newest / recently added</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </label>
      </div>
      <div className="catalog-layout">
        <aside className="filter-sidebar">
          <div className="filter-heading">
            <span>FILTER THE EDIT</span>
            <button onClick={clear}>CLEAR ALL</button>
          </div>
          <form
            className="catalog-search"
            onSubmit={(e) => {
              e.preventDefault();
              update("q", searchDraft);
            }}
          >
            <input
              aria-label="Search this collection"
              placeholder="Find a piece…"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
            />
            <button aria-label="Search collection">
              <Search size={16} />
            </button>
          </form>
          {controls("desktop")}
        </aside>
        <div>
          {selected.length > 0 && (
            <div className="filter-chips">
              {selected.map(([key, value]) => (
                <button key={key} onClick={() => update(key, "")}>
                  {key === "maxPrice" ? `Under ${value}` : value}
                  <X size={13} />
                  <span className="sr-only">Remove {key} filter</span>
                </button>
              ))}
              <button onClick={clear}>CLEAR ALL</button>
            </div>
          )}
          {result.length ? (
            <>
              <div className="product-grid catalog-grid">
                {result.slice(0, visible).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <div className="catalog-end">
                <p>
                  YOU’VE SEEN {Math.min(visible, result.length)} OF{" "}
                  {result.length} PIECES
                </p>
                {visible < result.length ? (
                  <button
                    className="button dark"
                    onClick={() => setVisible(visible + 12)}
                  >
                    DISCOVER MORE <ArrowUpRight size={18} />
                  </button>
                ) : (
                  <Link className="text-link" href="/collections">
                    EXPLORE THE COLLECTIONS <ArrowUpRight size={16} />
                  </Link>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <h2>
                NOTHING MATCHED
                <br />
                THAT SEARCH.
              </h2>
              <p>A fresh start might uncover something good.</p>
              <button className="button dark" onClick={clear}>
                CLEAR YOUR FILTERS <ArrowUpRight size={17} />
              </button>
            </div>
          )}
        </div>
      </div>
      <Modal
        open={mobile}
        onOpenChange={setMobile}
        title={`FILTER & SORT${selected.length ? ` (${selected.length})` : ""}`}
        variant="filters"
      >
        {controls("mobile")}
        <div className="mobile-filter-actions">
          <button className="text-link" onClick={clear}>
            CLEAR ALL
          </button>
          <button className="button dark" onClick={() => setMobile(false)}>
            VIEW {result.length} ITEMS <ArrowUpRight size={17} />
          </button>
        </div>
      </Modal>
    </section>
  );
}
