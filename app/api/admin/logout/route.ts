import { clearAdminSession } from "@/lib/admin/auth";
import { isStoreOrigin } from "@/lib/request-origin";
export async function POST(request: Request) {
  if (!isStoreOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  await clearAdminSession();
  return Response.json({ ok: true });
}
