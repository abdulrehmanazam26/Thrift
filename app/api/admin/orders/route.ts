import { z } from "zod";
import { isAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/custom-store/db";
import { isStoreOrigin } from "@/lib/request-origin";
const input = z.object({ id: z.string().uuid(), status: z.enum(["new", "confirmed", "packed", "out_for_delivery", "delivered", "cancelled"]) });
export async function PATCH(request: Request) {
  if (!isStoreOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid order update." }, { status: 400 });
  const sql = db();
  try {
    await sql.begin(async (tx) => {
      const rows = await tx`select status from store_private.orders where id = ${parsed.data.id} for update`;
      if (!rows[0]) throw new Error("Order not found.");
      const old = rows[0].status as string;
      const next = parsed.data.status;
      if (old === "cancelled" && next !== "cancelled") throw new Error("Cancelled orders cannot be reopened. Create a new order instead.");
      if (old !== "cancelled" && next === "cancelled") {
        const items = await tx`select product_id, quantity from store_private.order_items where order_id = ${parsed.data.id}`;
        for (const item of items) await tx`update store_private.products set stock = stock + ${item.quantity}, updated_at = now() where id = ${item.product_id}`;
      }
      await tx`update store_private.orders set status = ${next}, updated_at = now() where id = ${parsed.data.id}`;
    });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not update order." }, { status: 400 });
  }
}
