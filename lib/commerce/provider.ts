import { localProvider } from "./local";
import { shopifyProvider } from "./shopify";
export const commerce =
  process.env.COMMERCE_PROVIDER === "shopify" ? shopifyProvider : localProvider;
