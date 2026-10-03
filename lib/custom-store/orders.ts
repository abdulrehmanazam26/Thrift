import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import { db } from "./db";

export const orderInput = z.object({
  idempotencyKey: z.string().uuid(),
  lines: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1).max(10) })).min(1).max(20),
  customerName: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^\+?\d[\d\s-]{8,17}$/, "Enter a valid phone number."),
  email: z.union([z.email(), z.literal("")]).optional(),
  addressLine1: z.string().trim().min(8).max(200),
  addressLine2: z.string().trim().max(200).optional(),
  area: z.string().trim().min(2).max(100),
  city: z.literal("Karachi"),
  customerNote: z.string().trim().max(500).optional(),
});
export type OrderInput = z.infer<typeof orderInput>;

export function accessHash(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

export async function placeOrder(input: OrderInput) {
  const sql = db();
  return sql.begin(async (tx) => {
    const existing = await tx`select id, order_number, total from store_private.orders where idempotency_key = ${input.idempotencyKey}`;
    if (existing[0]) return { id: existing[0].id as string, orderNumber: Number(existing[0].order_number), total: Number(existing[0].total) };

    const settings = await tx`select delivery_fee, checkout_enabled from store_private.store_settings where singleton = true`;
    if (!settings[0]?.checkout_enabled) throw new Error("Checkout is temporarily closed. Please try again later.");
    const deliveryFee = Number(settings[0].delivery_fee);
    const seen = new Set<string>();
    const snapshots: Array<{ id: string; title: string; price: number; quantity: number }> = [];
    // A stable lock order avoids deadlocks across simultaneous multi-item orders.
    for (const line of [...input.lines].sort((a, b) => a.productId.localeCompare(b.productId))) {
      if (seen.has(line.productId)) throw new Error("A piece appears twice in your bag.");
      seen.add(line.productId);
      const rows = await tx`select id, title, price, stock from store_private.products where id = ${line.productId} and is_active = true for update`;
      const product = rows[0];
      if (!product || Number(product.stock) < line.quantity)
        throw new Error(`${product?.title || "A piece"} is no longer available. Please refresh your bag.`);
      snapshots.push({ id: product.id, title: product.title, price: Number(product.price), quantity: line.quantity });
    }
    const subtotal = snapshots.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const inserted = await tx`
      insert into store_private.orders
      (idempotency_key, access_token_hash, customer_name, phone, email, address_line1, address_line2,
       area, city, customer_note, subtotal, delivery_fee, total)
      values (${input.idempotencyKey}, ${accessHash(input.idempotencyKey)}, ${input.customerName}, ${input.phone},
        ${input.email || null}, ${input.addressLine1}, ${input.addressLine2 || null}, ${input.area},
        ${input.city}, ${input.customerNote || null}, ${subtotal}, ${deliveryFee}, ${subtotal + deliveryFee})
      returning id, order_number, total`;
    const order = inserted[0];
    for (const item of snapshots) {
      await tx`insert into store_private.order_items
        (order_id, product_id, product_title, unit_price, quantity, line_total)
        values (${order.id}, ${item.id}, ${item.title}, ${item.price}, ${item.quantity}, ${item.price * item.quantity})`;
      await tx`update store_private.products set stock = stock - ${item.quantity}, updated_at = now() where id = ${item.id}`;
    }
    return { id: order.id as string, orderNumber: Number(order.order_number), total: Number(order.total) };
  });
}

export async function getCustomerOrder(id: string, token: string) {
  const sql = db();
  const rows = await sql`select id, order_number, customer_name, subtotal, delivery_fee, total, status, created_at
    from store_private.orders where id = ${id} and access_token_hash = ${accessHash(token)} limit 1`;
  if (!rows[0]) return null;
  const items = await sql`select product_title, unit_price, quantity, line_total from store_private.order_items where order_id = ${id}`;
  const order = rows[0];
  return {
    id: String(order.id),
    order_number: Number(order.order_number),
    customer_name: String(order.customer_name),
    subtotal: Number(order.subtotal),
    delivery_fee: Number(order.delivery_fee),
    total: Number(order.total),
    status: String(order.status),
    items: items.map((item) => ({
      product_title: String(item.product_title),
      unit_price: Number(item.unit_price),
      quantity: Number(item.quantity),
      line_total: Number(item.line_total),
    })),
  };
}
