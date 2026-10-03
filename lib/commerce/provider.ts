import "server-only";
import type { CommerceProvider } from "./types";
import { databaseConfigured } from "@/lib/custom-store/db";
import { findProductByHandle, listCollections, listProducts } from "@/lib/custom-store/products";
import {
  findLocalPreviewProduct,
  listLocalPreviewProducts,
} from "@/lib/custom-store/local-preview";

// Shopify is deliberately not consulted: inventory and orders share our own database.
export const commerce: CommerceProvider = {
  mode: "custom",
  async getProducts() {
    return databaseConfigured() ? listProducts() : listLocalPreviewProducts();
  },
  async getProductByHandle(handle) {
    return databaseConfigured()
      ? findProductByHandle(handle)
      : findLocalPreviewProduct(handle);
  },
  async getCollections() {
    if (databaseConfigured()) return listCollections();
    const products = listLocalPreviewProducts();
    return [{
      id: "the-edit", handle: "the-edit", title: "The Edit",
      description: "A considered selection of one-of-a-kind pre-loved pieces.",
      image: products[0]?.images[0]?.src,
      productIds: products.map((item) => item.id),
      isDrop: false,
    }];
  },
  async createCheckout() {
    return { checkoutUrl: "/checkout" };
  },
};
