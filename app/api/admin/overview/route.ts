import { isAdmin } from "@/lib/admin/auth";
import { db, databaseConfigured } from "@/lib/custom-store/db";
import { listLocalPreviewProducts } from "@/lib/custom-store/local-preview";
export async function GET() {
  if (!(await isAdmin()))
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (process.env.NODE_ENV === "development" && !databaseConfigured()) {
    return Response.json(
      {
        products: listLocalPreviewProducts(true).map((product) => ({
          id: product.id,
          handle: product.handle,
          title: product.title,
          brand: product.brand,
          description: product.description,
          category: product.category,
          gender: product.gender,
          condition: product.condition,
          condition_notes: product.conditionNotes,
          size_label: product.sizeLabel,
          color: product.color,
          price: product.price,
          compare_at_price: product.compareAtPrice ?? null,
          stock: product.stock,
          images: product.images.map(({ src }) => ({ src })),
          is_active: product.isActive,
        })),
        orders: [],
        settings: { delivery_fee: 250, checkout_enabled: false },
        stats: { orders: 0, delivered_revenue: 0, new_orders: 0 },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  const sql = db();
  const [products, orders, settings, stats] = await Promise.all([
    sql`select * from store_private.products order by created_at desc`,
    sql`select o.*, coalesce(json_agg(json_build_object('product_title', i.product_title, 'quantity', i.quantity, 'unit_price', i.unit_price, 'product_id', i.product_id)) filter (where i.id is not null), '[]'::json) as items
      from store_private.orders o left join store_private.order_items i on i.order_id = o.id group by o.id order by o.created_at desc limit 100`,
    sql`select delivery_fee, checkout_enabled from store_private.store_settings where singleton = true`,
    sql`select count(*) filter (where status != 'cancelled')::int as orders,
      coalesce(sum(total) filter (where status = 'delivered'), 0)::int as delivered_revenue,
      count(*) filter (where status = 'new')::int as new_orders from store_private.orders`,
  ]);
  return Response.json(
    { products, orders, settings: settings[0], stats: stats[0] },
    { headers: { "Cache-Control": "no-store" } },
  );
}
