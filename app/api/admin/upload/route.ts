import { isAdmin } from "@/lib/admin/auth";
import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { db, databaseConfigured } from "@/lib/custom-store/db";
import { isStoreOrigin } from "@/lib/request-origin";

export async function POST(request: Request) {
  if (!isStoreOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const form = await request.formData();
    const file = form.get("image");
    if (!(file instanceof File) || file.size === 0 || file.size > 3 * 1024 * 1024)
      return Response.json({ error: "Choose an image under 3 MB." }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const png = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const webp = bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP";
    const type = png ? "image/png" : jpeg ? "image/jpeg" : webp ? "image/webp" : null;
    if (!type) return Response.json({ error: "Only PNG, JPEG or WebP photos are supported." }, { status: 400 });
    if (process.env.NODE_ENV === "development" && !databaseConfigured()) {
      const extension = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
      const filename = `admin-${randomUUID()}.${extension}`;
      await writeFile(join(process.cwd(), "public", "images", "products", filename), bytes);
      return Response.json({ url: `/images/products/${filename}` });
    }
    const rows = await db()`insert into store_private.product_images (content_type, data) values (${type}, ${bytes}) returning id`;
    return Response.json({ url: `/api/product-images/${rows[0].id}` });
  } catch (error) {
    console.error("Photo upload failed", error);
    return Response.json({ error: "Photo could not be uploaded." }, { status: 503 });
  }
}
