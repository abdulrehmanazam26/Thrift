import { z } from "zod";
import { isAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/custom-store/db";
import { isStoreOrigin } from "@/lib/request-origin";
const input = z.object({ checkoutEnabled: z.boolean() });
export async function PATCH(request: Request) {
  if (!isStoreOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid setting." }, { status: 400 });
  await db()`update store_private.store_settings set checkout_enabled = ${parsed.data.checkoutEnabled}, updated_at = now() where singleton = true`;
  return Response.json({ ok: true });
}
