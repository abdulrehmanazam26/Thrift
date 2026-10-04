import type { RowDataPacket } from "mysql2";
import { isAdmin } from "@/lib/admin/auth";
import { mysqlDb, storeSettings } from "@/lib/custom-store/mysql";

const toUiStatus = (value: string) =>
  ({ pending: "new", confirmed: "confirmed", processing: "packed", shipped: "out_for_delivery", delivered: "delivered", cancelled: "cancelled" }[value] || value);

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const sql = mysqlDb();
  const [products] = await sql.query<RowDataPacket[]>("SELECT p.id, p.slug AS handle, p.product_name AS title, p.brand, p.full_description AS description, c.category_name AS category, p.gender, p.condition_grade AS `condition`, p.condition_notes, p.size_label, p.color, COALESCE(p.sale_price,p.price) AS price, p.price AS compare_at_price, p.stock, p.status, (SELECT image_path FROM product_images WHERE product_id=p.id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) AS image FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.status <> 'deleted' ORDER BY p.created_at DESC");
  const [orders] = await sql.query<RowDataPacket[]>("SELECT o.id,o.order_number,o.customer_name,o.customer_email,o.customer_phone,o.shipping_address,o.area,o.city,o.customer_notes,o.subtotal,o.shipping_amount,o.total_amount,o.order_status,o.created_at,COALESCE((SELECT JSON_ARRAYAGG(JSON_OBJECT('product_title',i.product_name,'quantity',i.quantity,'unit_price',i.price,'product_id',i.product_id)) FROM order_items i WHERE i.order_id=o.id),JSON_ARRAY()) AS items FROM orders o ORDER BY o.created_at DESC LIMIT 100");
  const settings = await storeSettings();
  const [[stats]] = await sql.query<RowDataPacket[]>("SELECT COUNT(*) AS orders, COALESCE(SUM(CASE WHEN order_status='delivered' THEN total_amount ELSE 0 END),0) AS delivered_revenue, SUM(order_status='pending') AS new_orders FROM orders");

  return Response.json({
    products: products.map((p) => ({ ...p, category: p.category || "Clothing", images: p.image ? [{ src: p.image }] : [], is_active: p.status === "active" })),
    orders: orders.map((o) => ({ ...o, phone: o.customer_phone, email: o.customer_email, address_line1: o.shipping_address, address_line2: null, customer_note: o.customer_notes, delivery_fee: Number(o.shipping_amount), total: Number(o.total_amount), status: toUiStatus(o.order_status), items: typeof o.items === "string" ? JSON.parse(o.items) : o.items })),
    settings: { delivery_fee: settings.deliveryFee, checkout_enabled: settings.checkoutEnabled },
    stats: { orders: Number(stats.orders), delivered_revenue: Number(stats.delivered_revenue), new_orders: Number(stats.new_orders) },
  }, { headers: { "Cache-Control": "no-store" } });
}
