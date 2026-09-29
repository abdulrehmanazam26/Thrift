import { getProducts } from "@/lib/commerce/products";
import { commerce } from "@/lib/commerce/provider";
export async function GET() {
  try {
    return Response.json(
      { products: await getProducts(), mode: commerce.mode },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "The catalog could not be refreshed. Please try again." },
      { status: 503 },
    );
  }
}
