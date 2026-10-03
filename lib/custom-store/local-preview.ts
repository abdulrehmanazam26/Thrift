import "server-only";
import { randomUUID } from "node:crypto";
import type { Condition, Product } from "@/lib/commerce/types";
import { catalogFallback } from "./catalog-fallback";

export type LocalPreviewProduct = Product & { isActive: boolean };

export type LocalPreviewProductInput = {
  id?: string;
  handle: string;
  title: string;
  brand: string;
  description: string;
  category: string;
  gender: string;
  condition: Condition;
  conditionNotes: string;
  sizeLabel: string;
  color: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  imageUrls: string[];
  isActive: boolean;
};

const previewProducts: LocalPreviewProduct[] = catalogFallback.map((product) => ({
  ...product,
  images: [...product.images],
  isActive: true,
}));

export function listLocalPreviewProducts(includeInactive = false) {
  return previewProducts.filter((product) => includeInactive || product.isActive);
}

export function findLocalPreviewProduct(handle: string) {
  return previewProducts.find(
    (product) => product.handle === handle && product.isActive,
  );
}

export function saveLocalPreviewProduct(input: LocalPreviewProductInput) {
  const index = input.id
    ? previewProducts.findIndex((product) => product.id === input.id)
    : -1;
  const existing = index >= 0 ? previewProducts[index] : undefined;
  const product: LocalPreviewProduct = {
    id: existing?.id || randomUUID(),
    handle: input.handle,
    title: input.title,
    brand: input.brand || "Unbranded",
    description: input.description,
    category: input.category,
    gender: input.gender,
    style: existing?.style || [],
    condition: input.condition,
    conditionNotes: input.conditionNotes,
    sizeLabel: input.sizeLabel,
    measurements: existing?.measurements || {},
    color: input.color,
    price: input.price,
    compareAtPrice: input.compareAtPrice || undefined,
    stock: input.stock,
    images: input.imageUrls.map((src, index) => ({
      src,
      alt: input.title,
      label: `Photo ${index + 1}`,
    })),
    defects: existing?.defects || [],
    tags: existing?.tags || [],
    collection: existing?.collection || ["the-edit"],
    currency: "PKR",
    createdAt: existing?.createdAt || new Date().toISOString(),
    isActive: input.isActive,
  };
  if (index >= 0) previewProducts[index] = product;
  else previewProducts.unshift(product);
  return product;
}
