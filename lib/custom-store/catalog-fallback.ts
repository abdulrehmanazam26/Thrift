import type { Condition, Product } from "@/lib/commerce/types";

// Read-only display catalog while the private database is being provisioned.
// Checkout never accepts orders without the database.
const pieces: Array<[string, string, string, string, number, Condition, number]> = [
  ["comptoir-des-cotonniers-piece", "Comptoir des Cotonniers Piece", "Comptoir des Cotonniers", "Comptoir_des_Cotonniers_try-on-preview.png", 2000, "Good", 1],
  ["dolce-gabbana-piece", "Dolce & Gabbana Piece", "Dolce & Gabbana", "Dolce_and_Gabbana_try-on-preview.png", 2000, "Premium", 1],
  ["zara-basic-piece-1", "Zara Basic Piece 1", "Zara", "Zara_Basic_try-on-preview-1.png", 2000, "Good", 1],
  ["zara-basic-piece-2", "Zara Basic Piece 2", "Zara", "Zara_Basic_try-on-preview-2.png", 2000, "Good", 1],
  ["zara-basic-piece-3", "Zara Basic Piece 3", "Zara", "Zara_Basic_try-on-preview-3.png", 2000, "Good", 1],
  ["zara-basic-piece-4", "Zara Basic Piece 4", "Zara", "Zara_Basic_try-on-preview-4.png", 1100, "Good", 1],
  ["massimo-dutti-blue-piece", "Massimo Dutti Blue Piece", "Massimo Dutti", "Massimo_Dutti_try-on-preview-blue.png", 2000, "Excellent", 1],
  ["massimo-dutti-rust-piece", "Massimo Dutti Rust Piece", "Massimo Dutti", "Massimo_Dutti_try-on-preview-rust.png", 1500, "Excellent", 1],
  ["massimo-dutti-yellow-piece", "Massimo Dutti Yellow Piece", "Massimo Dutti", "Massimo_Dutti_try-on-preview-yellow.png", 1300, "Very good", 1],
  ["zara-knit-piece", "Zara Knit Piece", "Zara", "Zara_Knit_try-on-preview.png", 1200, "Very good", 1],
  ["zara-piece", "Zara Piece", "Zara", "Zara_try-on-preview.png", 1500, "Excellent", 0],
];

export const catalogFallback: Product[] = pieces.map(([handle, title, brand, file, price, condition, stock], index) => ({
  id: `7c000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
  handle,
  title,
  brand,
  description: "A one-of-a-kind pre-loved find. Please check the photos and ask us for measurements or condition details before ordering.",
  category: "Clothing",
  gender: "Women",
  style: [],
  condition,
  conditionNotes: "Pre-loved piece. Detailed condition notes are being reviewed; contact us for specific details.",
  sizeLabel: "Ask for size",
  measurements: {},
  color: "See photos",
  price,
  compareAtPrice: price * 2,
  stock,
  currency: "PKR",
  images: [{ src: `/images/products/${file}`, alt: title, label: "Product photo" }],
  defects: [],
  tags: [],
  collection: ["the-edit"],
  createdAt: new Date(Date.UTC(2026, 8, 29, 21, index)).toISOString(),
}));
