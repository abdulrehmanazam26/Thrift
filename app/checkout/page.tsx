import type { Metadata } from "next";
import { Checkout } from "./Checkout";
import { adminConfigured } from "@/lib/admin/auth";
import { databaseConfigured } from "@/lib/custom-store/db";
import { storeSettings } from "@/lib/custom-store/mysql";
export const metadata: Metadata = { title: "Secure checkout", robots: { index: false, follow: false } };
export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ buy?: string }> }) { const { buy } = await searchParams; let checkoutOpen = false; if (databaseConfigured() && adminConfigured()) { try { checkoutOpen = (await storeSettings()).checkoutEnabled; } catch {} } return <Checkout buyId={buy} checkoutOpen={checkoutOpen} />; }
