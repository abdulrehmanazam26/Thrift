import { ZodError } from "zod";
import { databaseConfigured } from "@/lib/custom-store/db";
import { orderInput, placeOrder } from "@/lib/custom-store/orders";
import { isStoreOrigin } from "@/lib/request-origin";
import { cookies } from "next/headers";
import { createHmac } from "node:crypto";
import { db } from "@/lib/custom-store/db";
import { adminConfigured } from "@/lib/admin/auth";

export async function POST(request: Request) {
  if (!isStoreOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  if (!databaseConfigured() || !adminConfigured()) return Response.json({ error: "Orders are not open yet. Please try again later." }, { status: 503 });
  try {
    const raw = await request.text();
    if (raw.length > 16000) return Response.json({ error: "Order request is too large." }, { status: 413 });
    const input = orderInput.parse(JSON.parse(raw));
    const ip = (request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    const ipHash = createHmac("sha256", process.env.ADMIN_SESSION_SECRET!)
      .update(ip).digest("hex");
    const attempts = await db()`insert into store_private.checkout_attempts as attempt (ip_hash, attempts, updated_at)
      values (${ipHash}, 1, now()) on conflict (ip_hash) do update
      set attempts = case when attempt.updated_at < now() - interval '15 minutes' then 1 else attempt.attempts + 1 end,
          updated_at = now() returning attempts`;
    if (Number(attempts[0].attempts) > 10)
      return Response.json({ error: "Too many order attempts. Please try again later." }, { status: 429 });
    const order = await placeOrder(input);
    (await cookies()).set("thrift_last_order", `${order.id}.${input.idempotencyKey}`, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
      path: "/order", maxAge: 60 * 60 * 24 * 30,
    });
    return Response.json(order, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ZodError) return Response.json({ error: error.issues[0]?.message || "Check your details." }, { status: 400 });
    if (error instanceof SyntaxError) return Response.json({ error: "Invalid request." }, { status: 400 });
    const message = error instanceof Error ? error.message : "Could not place the order.";
    if (/no longer available|appears twice|temporarily closed/.test(message)) return Response.json({ error: message }, { status: 409 });
    console.error("Order placement failed", error);
    return Response.json({ error: "Could not place the order. Please try again." }, { status: 503 });
  }
}
