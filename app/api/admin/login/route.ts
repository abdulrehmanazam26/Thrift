import { createHmac } from "node:crypto";
import { z } from "zod";
import {
  adminConfigured,
  setAdminSession,
  verifyPassword,
} from "@/lib/admin/auth";
import { db, databaseConfigured } from "@/lib/custom-store/db";
import { isStoreOrigin } from "@/lib/request-origin";

const loginInput = z.object({
  username: z.string().max(80),
  password: z.string().max(200),
});
const localAttempts = new Map<
  string,
  { count: number; since: number; blockedUntil: number }
>();
export async function POST(request: Request) {
  if (!isStoreOrigin(request))
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const demoMode =
    process.env.NODE_ENV === "development" && !databaseConfigured();
  if (!adminConfigured() || (!databaseConfigured() && !demoMode))
    return Response.json(
      { error: "Admin setup is incomplete." },
      { status: 503 },
    );
  const parsed = loginInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json({ error: "Invalid sign-in." }, { status: 400 });
  const ip = (request.headers.get("x-forwarded-for") || "unknown")
    .split(",")[0]
    .trim();
  const ipHash = createHmac("sha256", process.env.ADMIN_SESSION_SECRET!)
    .update(ip)
    .digest("hex");
  if (demoMode) {
    const now = Date.now();
    const previous = localAttempts.get(ipHash);
    if (previous && previous.blockedUntil > now)
      return Response.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 },
      );
    if (!verifyPassword(parsed.data.username, parsed.data.password)) {
      const count =
        previous && now - previous.since < 15 * 60_000 ? previous.count + 1 : 1;
      localAttempts.set(ipHash, {
        count,
        since:
          previous && now - previous.since < 15 * 60_000 ? previous.since : now,
        blockedUntil: count >= 5 ? now + 15 * 60_000 : 0,
      });
      return Response.json(
        { error: "Incorrect ID or password." },
        { status: 401 },
      );
    }
    localAttempts.delete(ipHash);
    await setAdminSession();
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  const sql = db();
  try {
    const attempts =
      await sql`select attempts, blocked_until from store_private.admin_login_attempts where ip_hash = ${ipHash}`;
    if (
      attempts[0]?.blocked_until &&
      new Date(attempts[0].blocked_until).getTime() > Date.now()
    )
      return Response.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 },
      );
    if (!verifyPassword(parsed.data.username, parsed.data.password)) {
      await sql`insert into store_private.admin_login_attempts as attempt (ip_hash, attempts, blocked_until, updated_at)
        values (${ipHash}, 1, null, now()) on conflict (ip_hash) do update
        set attempts = case when attempt.updated_at < now() - interval '15 minutes' then 1 else attempt.attempts + 1 end,
            blocked_until = case when attempt.attempts >= 4 and attempt.updated_at >= now() - interval '15 minutes' then now() + interval '15 minutes' else null end,
            updated_at = now()`;
      return Response.json(
        { error: "Incorrect ID or password." },
        { status: 401 },
      );
    }
    await sql`delete from store_private.admin_login_attempts where ip_hash = ${ipHash}`;
    await setAdminSession();
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Admin sign-in failed", error);
    return Response.json(
      { error: "Sign-in unavailable right now." },
      { status: 503 },
    );
  }
}
