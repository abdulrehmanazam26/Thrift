import { cache } from "react";
import { commerce } from "./provider";
export const getProducts = cache(() => commerce.getProducts());
export const getProductByHandle = cache((handle: string) =>
  commerce.getProductByHandle(handle),
);
