export type Condition = "Like new" | "Excellent" | "Very good" | "Good";
export type ProductImage = { src: string; alt: string; label: string };
export type Product = {
  id: string;
  variantId?: string;
  handle: string;
  title: string;
  brand: string;
  description: string;
  category: string;
  gender: string;
  style: string[];
  condition: Condition;
  conditionNotes: string;
  sizeLabel: string;
  measurements: Record<string, number>;
  color: string;
  material?: string;
  price: number;
  currency: string;
  compareAtPrice?: number;
  stock: number;
  images: ProductImage[];
  defects: string[];
  tags: string[];
  collection: string[];
  createdAt: string;
  era?: string;
  sample?: boolean;
};
export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image?: string;
  productIds: string[];
  isDrop?: boolean;
};
export type CartInput = { productId: string; quantity: number };
export type CartLine = CartInput & { product: Product };
export interface CommerceProvider {
  mode: "local" | "shopify";
  getProducts(): Promise<Product[]>;
  getProductByHandle(handle: string): Promise<Product | undefined>;
  getCollections(): Promise<Collection[]>;
  createCheckout(lines: CartInput[]): Promise<{ checkoutUrl: string }>;
}
