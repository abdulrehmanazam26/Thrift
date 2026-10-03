import { db } from "@/lib/custom-store/db";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });
  const rows = await db()`select content_type, data from store_private.product_images where id = ${id} limit 1`;
  if (!rows[0]) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(rows[0].data as Uint8Array), {
    headers: { "Content-Type": String(rows[0].content_type), "Cache-Control": "public, max-age=86400, immutable", "X-Content-Type-Options": "nosniff" },
  });
}
