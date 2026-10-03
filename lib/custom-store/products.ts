import "server-only";
import type { Collection, Condition, Product, ProductImage } from "@/lib/commerce/types";
import { db } from "./db";

type ProductRow = {
  id: string;
  handle: string;
  title: string;
  brand: string;
  description: string;
  category: string;
  gender: string;
  style: string[];
  condition: Condition;
  condition_notes: string;
  size_label: string;
  measurements: Record<string, number>;
  color: string;
  material: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  images: ProductImage[];
  defects: string[];
  tags: string[];
  collections: string[];
  era: string | null;
  is_active: boolean;
  created_at: Date | string;
};

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    handle: row.handle,
    title: row.title,
    brand: row.brand,
    description: row.description,
    category: row.category,
    gender: row.gender,
    style: row.style,
    condition: row.condition,
    conditionNotes: row.condition_notes,
    sizeLabel: row.size_label,
    measurements: row.measurements,
    color: row.color,
    material: row.material || undefined,
    price: row.price,
    compareAtPrice: row.compare_at_price || undefined,
    stock: row.stock,
    images: row.images,
    defects: row.defects,
    tags: row.tags,
    collection: row.collections,
    era: row.era || undefined,
    currency: "PKR",
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function listProducts(includeInactive = false) {
  const sql = db();
  const rows = includeInactive
    ? await sql`select * from store_private.products order by created_at desc`
    : await sql`select * from store_private.products where is_active = true order by created_at desc`;
  return rows.map((row) => mapProduct(row as ProductRow));
}

export async function findProductByHandle(handle: string) {
  const sql = db();
  const rows = await sql`select * from store_private.products where handle = ${handle} and is_active = true limit 1`;
  return rows[0] ? mapProduct(rows[0] as ProductRow) : undefined;
}

export async function listCollections(): Promise<Collection[]> {
  const products = await listProducts();
  const handles = [...new Set(products.flatMap((product) => product.collection))];
  return handles.map((handle) => {
    const members = products.filter((product) => product.collection.includes(handle));
    return {
      id: handle,
      handle,
      title: handle.split("-").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" "),
      description: `Curated pre-loved pieces from our ${handle.replaceAll("-", " ")} edit.`,
      image: members[0]?.images[0]?.src,
      productIds: members.map((product) => product.id),
      isDrop: handle === "new-drop",
    };
  });
}
