import { z } from "zod";
import { createCheckout } from "@/lib/commerce/checkout";
import { commerce } from "@/lib/commerce/provider";
import { isStoreOrigin } from "@/lib/request-origin";
const schema = z.object({
  lines: z
    .array(
      z.object({
        productId: z.string().min(1).max(200),
        quantity: z.number().int().positive().max(99),
      }),
    )
    .min(1)
    .max(50),
});
export async function POST(request: Request) {
  if (!isStoreOrigin(request))
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  if (commerce.mode === "local")
    return Response.json(
      {
        error:
          "This is a storefront preview. Orders and payments are not open yet.",
      },
      { status: 409 },
    );
  try {
    const { lines } = schema.parse(await request.json());
    return Response.json(await createCheckout(lines));
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Checkout is unavailable. Please try again.",
      },
      { status: 400 },
    );
  }
}
