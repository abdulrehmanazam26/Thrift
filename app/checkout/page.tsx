import type { Metadata } from "next";
import { Checkout } from "./Checkout";
import { db, databaseConfigured } from "@/lib/custom-store/db";
import { adminConfigured } from "@/lib/admin/auth";
export const metadata: Metadata = {
  title: "Secure checkout",
  robots: { index: false, follow: false },
};
export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ buy?: string }>;
}) {
  const { buy } = await searchParams;
  let checkoutOpen = false;
  if (databaseConfigured() && adminConfigured()) {
    try {
      const rows =
        await db()`select checkout_enabled from store_private.store_settings where singleton = true`;
      checkoutOpen = Boolean(rows[0]?.checkout_enabled);
    } catch {
      checkoutOpen = false;
    }
  }
  return <Checkout buyId={buy} checkoutOpen={checkoutOpen} />;
}
