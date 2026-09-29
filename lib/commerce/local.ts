import type { CommerceProvider } from "./types";
import { sampleProducts, sampleCollections } from "./local-data";
export const localProvider: CommerceProvider = {
  mode: "local",
  async getProducts() {
    return sampleProducts;
  },
  async getProductByHandle(handle) {
    return sampleProducts.find((p) => p.handle === handle);
  },
  async getCollections() {
    return sampleCollections;
  },
  async createCheckout() {
    throw new Error(
      "This is a storefront preview. Orders and payments are not open yet.",
    );
  },
};
