import type { CartInput, CartLine, Product } from "./types";
export function validateCart(
  lines: CartInput[],
  products: Product[],
): CartLine[] {
  const seen = new Set<string>();
  return lines.map((line) => {
    const product = products.find((p) => p.id === line.productId);
    if (!product)
      throw new Error(
        "A piece in your bag is no longer listed. Please remove it.",
      );
    if (seen.has(line.productId))
      throw new Error("This piece is already in your bag.");
    seen.add(line.productId);
    if (
      !Number.isInteger(line.quantity) ||
      line.quantity < 1 ||
      line.quantity > product.stock
    )
      throw new Error(
        `${product.title} is no longer available in the requested quantity.`,
      );
    return { ...line, product };
  });
}
export function addToCart(lines: CartInput[], product: Product): CartInput[] {
  const existing = lines.find((l) => l.productId === product.id);
  if (product.stock < 1) throw new Error("This piece has gone from the Vault.");
  if (existing) return lines;
  return [...lines, { productId: product.id, quantity: 1 }];
}
export function getCart(lines: CartInput[], products: Product[]) {
  return lines.flatMap((line) => {
    const product = products.find((p) => p.id === line.productId);
    return product ? [{ ...line, product }] : [];
  });
}
