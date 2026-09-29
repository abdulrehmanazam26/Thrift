import { commerce } from "./provider";
import type { CartInput } from "./types";
export const createCheckout = (lines: CartInput[]) =>
  commerce.createCheckout(lines);
