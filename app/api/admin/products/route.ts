import { z } from "zod";
import { isAdmin } from "@/lib/admin/auth";
import { db, databaseConfigured } from "@/lib/custom-store/db";
import {
  listLocalPreviewProducts,
  saveLocalPreviewProduct,
} from "@/lib/custom-store/local-preview";
import { isStoreOrigin } from "@/lib/request-origin";

const productInput = z.object({
  id: z.string().uuid().optional(),
  handle: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(120),
  title: z.string().trim().min(2).max(160),
  brand: z.string().trim().max(100).default("Unbranded"),
  description: z.string().trim().max(4000).default(""),
  category: z.string().trim().min(1).max(80).default("Clothing"),
  gender: z.string().trim().max(40).default("Unisex"),
  condition: z.enum(["Premium", "Like new", "Excellent", "Very good", "Good"]),
  conditionNotes: z.string().trim().max(2000).default(""),
  sizeLabel: z.string().trim().max(80).default("Ask for size"),
  color: z.string().trim().max(80).default("See photos"),
  price: z.number().int().min(0).max(1000000),
  compareAtPrice: z.number().int().min(0).max(1000000).nullable(),
  stock: z.number().int().min(0).max(10000),
  imageUrls: z.array(z.string().max(1000).refine((value) => value.startsWith("/images/products/") || value.startsWith("/api/product-images/") || /^https:\/\//.test(value))).max(10),
  isActive: z.boolean(),
});

export async function POST(request: Request) {
  if (!isStoreOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const parsed = productInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message || "Invalid product." }, { status: 400 });
  const p = parsed.data;
  if (p.isActive && p.imageUrls.length === 0) return Response.json({ error: "Add at least one photo before publishing." }, { status: 400 });
  if (p.compareAtPrice !== null && p.compareAtPrice < p.price) return Response.json({ error: "Original price cannot be lower than sale price." }, { status: 400 });
  if (process.env.NODE_ENV === "development" && !databaseConfigured()) {
    const duplicate = listLocalPreviewProducts(true).some(
      (product) => product.handle === p.handle && product.id !== p.id,
    );
    if (duplicate)
      return Response.json({ error: "This product URL is already used." }, { status: 409 });
    const product = saveLocalPreviewProduct(p);
    return Response.json({ id: product.id });
  }
  const images = JSON.stringify(p.imageUrls.map((src, index) => ({ src, alt: p.title, label: `Photo ${index + 1}` })));
  const sql = db();
  try {
    const rows = p.id
      ? await sql`update store_private.products set handle = ${p.handle}, title = ${p.title}, brand = ${p.brand}, description = ${p.description}, category = ${p.category}, gender = ${p.gender}, condition = ${p.condition}, condition_notes = ${p.conditionNotes}, size_label = ${p.sizeLabel}, color = ${p.color}, price = ${p.price}, compare_at_price = ${p.compareAtPrice}, stock = ${p.stock}, images = ${images}::jsonb, is_active = ${p.isActive}, updated_at = now() where id = ${p.id} returning id`
      : await sql`insert into store_private.products (handle, title, brand, description, category, gender, condition, condition_notes, size_label, color, price, compare_at_price, stock, images, is_active) values (${p.handle}, ${p.title}, ${p.brand}, ${p.description}, ${p.category}, ${p.gender}, ${p.condition}, ${p.conditionNotes}, ${p.sizeLabel}, ${p.color}, ${p.price}, ${p.compareAtPrice}, ${p.stock}, ${images}::jsonb, ${p.isActive}) returning id`;
    if (!rows[0]) return Response.json({ error: "Product not found." }, { status: 404 });
    return Response.json({ id: rows[0].id });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505")
      return Response.json({ error: "This product URL is already used." }, { status: 409 });
    console.error("Product save failed", error);
    return Response.json({ error: "Could not save product." }, { status: 503 });
  }
}
