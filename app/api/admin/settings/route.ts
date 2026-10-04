import { z } from "zod";
import { isAdmin } from "@/lib/admin/auth";
import { mysqlDb } from "@/lib/custom-store/mysql";
import { isStoreOrigin } from "@/lib/request-origin";
const input = z.object({ checkoutEnabled: z.boolean() });
export async function PATCH(request: Request) { if (!isStoreOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 }); if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 }); const parsed = input.safeParse(await request.json().catch(() => null)); if (!parsed.success) return Response.json({ error: "Invalid setting." }, { status: 400 }); await mysqlDb().execute("INSERT INTO site_settings (setting_key,setting_value) VALUES ('checkout_enabled',?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)", [parsed.data.checkoutEnabled ? "true" : "false"]); return Response.json({ ok: true }); }
