import type { Product } from "./types";
export type Filters = {
  category?: string;
  gender?: string;
  brand?: string;
  size?: string;
  condition?: string;
  color?: string;
  style?: string;
  availability?: string;
  maxPrice?: number;
  query?: string;
  sort?: string;
};
const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/t-shirt/g, "tee")
    .replace(/sweatshirt/g, "hoodie")
    .replace(/\blarge\b/g, "l")
    .replace(/\bmedium\b/g, "m")
    .replace(/\bsmall\b/g, "s")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
export function filterProducts(products: Product[], filters: Filters) {
  const result = products.filter((p) => {
    const text = normalize(
      [
        p.title,
        p.brand,
        p.category,
        p.color,
        p.sizeLabel,
        ...p.style,
        ...p.tags,
        p.gender,
      ].join(" "),
    );
    return (
      (!filters.query ||
        normalize(filters.query)
          .split(" ")
          .every((term) =>
            text.split(" ").some((word) => word.startsWith(term)),
          )) &&
      (!filters.category || p.category === filters.category) &&
      (!filters.gender ||
        p.gender === filters.gender ||
        (p.gender === "Unisex" && filters.gender !== "Unisex")) &&
      (!filters.brand || p.brand === filters.brand) &&
      (!filters.size || p.sizeLabel === filters.size) &&
      (!filters.condition || p.condition === filters.condition) &&
      (!filters.color || p.color === filters.color) &&
      (!filters.style || p.style.includes(filters.style)) &&
      (filters.availability !== "available" || p.stock > 0) &&
      (filters.availability !== "sold" || p.stock === 0) &&
      (!filters.maxPrice || p.price <= filters.maxPrice)
    );
  });
  return result.sort((a, b) =>
    filters.sort === "price-low"
      ? a.price - b.price
      : filters.sort === "price-high"
        ? b.price - a.price
        : b.createdAt.localeCompare(a.createdAt),
  );
}
