import type {
  CartInput,
  Collection,
  CommerceProvider,
  Condition,
  Product,
} from "./types";
import { validateCart } from "./cart";
type Field = { key: string; value: string };
type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  description: string;
  productType: string;
  tags: string[];
  createdAt: string;
  images: { nodes: { url: string; altText: string | null }[] };
  metafields: (Field | null)[];
  variants: {
    nodes: {
      id: string;
      availableForSale: boolean;
      quantityAvailable?: number | null;
      price: { amount: string; currencyCode: string };
      compareAtPrice?: { amount: string } | null;
    }[];
  };
  collections: { nodes: { handle: string }[] };
};
const keys = [
  "condition",
  "condition_notes",
  "brand",
  "label_size",
  "pit_to_pit",
  "length",
  "shoulder",
  "sleeve",
  "waist",
  "rise",
  "inseam",
  "leg_opening",
  "material",
  "color",
  "era",
  "style",
  "defects",
  "gender",
];
const fields = `id handle title vendor description productType tags createdAt images(first:20){nodes{url altText}} variants(first:2){nodes{id availableForSale price{amount currencyCode} compareAtPrice{amount}}} collections(first:30){nodes{handle}} metafields(identifiers:[${keys.map((key) => `{namespace:"thrift",key:"${key}"}`).join(",")}]){key value}`;
async function request<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!domain || !token || !/^[-a-z0-9]+\.myshopify\.com$/.test(domain))
    throw new Error("Shopify configuration is incomplete.");
  const result = await fetch(
    `https://${domain}/api/${process.env.SHOPIFY_API_VERSION || "2026-07"}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    },
  );
  if (!result.ok)
    throw new Error("The store is temporarily unavailable. Please try again.");
  const body = (await result.json()) as {
    data: T;
    errors?: { message: string }[];
  };
  if (body.errors?.length)
    throw new Error(
      "Shopify could not load the requested information. Check storefront access and product metafield visibility.",
    );
  return body.data;
}
function list(value?: string) {
  if (!value) return [];
  try {
    const result = JSON.parse(value);
    if (Array.isArray(result)) return result.map(String);
  } catch {}
  return value
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}
function mapProduct(p: ShopifyProduct): Product {
  const f = Object.fromEntries(
    p.metafields.filter((m): m is Field => !!m).map((m) => [m.key, m.value]),
  );
  if (p.variants.nodes.length !== 1)
    throw new Error(
      `Product ${p.handle} needs one variant per unique garment. Split distinct pieces into separate products.`,
    );
  const v = p.variants.nodes[0];
  const conditions: Condition[] = [
    "Like new",
    "Excellent",
    "Very good",
    "Good",
  ];
  const condition = conditions.find(
    (c) => c.toLowerCase() === f.condition?.toLowerCase(),
  );
  const resolvedCondition = condition || "Good";
  const measurements: Record<string, number> = {};
  const map: Record<string, string> = {
    pit_to_pit: "Chest",
    length: "Length",
    shoulder: "Shoulder",
    sleeve: "Sleeve",
    waist: "Waist",
    rise: "Rise",
    inseam: "Inseam",
    leg_opening: "Leg opening",
  };
  for (const [key, label] of Object.entries(map)) {
    if (f[key] && Number(f[key]) > 0) measurements[label] = Number(f[key]);
  }
  const localFallbackImages: Record<string, string> = {
    "comptoir-des-cotonniers-piece": "/images/products/Comptoir_des_Cotonniers_try-on-preview.png",
    "dolce-gabbana-piece": "/images/products/Dolce_and_Gabbana_try-on-preview.png",
    "massimo-dutti-blue-piece": "/images/products/Massimo_Dutti_try-on-preview-blue.png",
    "massimo-dutti-rust-piece": "/images/products/Massimo_Dutti_try-on-preview-rust.png",
    "massimo-dutti-yellow-piece": "/images/products/Massimo_Dutti_try-on-preview-yellow.png",
    "zara-basic-piece-1": "/images/products/Zara_Basic_try-on-preview-1.png",
    "zara-basic-piece-2": "/images/products/Zara_Basic_try-on-preview-2.png",
    "zara-basic-piece-3": "/images/products/Zara_Basic_try-on-preview-3.png",
    "zara-basic-piece-4": "/images/products/Zara_Basic_try-on-preview-4.png",
    "zara-knit-piece": "/images/products/Zara_Knit_try-on-preview.png",
    "zara-piece": "/images/products/Zara_try-on-preview.png",
  };
  const images = p.images.nodes.length
    ? p.images.nodes.map((im, i) => ({
        src: im.url,
        alt: im.altText || `${p.title} — photo ${i + 1}`,
        label: im.altText || `Photo ${i + 1}`,
      }))
    : localFallbackImages[p.handle]
      ? [{
          src: localFallbackImages[p.handle],
          alt: `${p.title} — photo 1`,
          label: "Photo 1",
        }]
      : [];
  return {
    id: p.id,
    variantId: v.id,
    handle: p.handle,
    title: p.title,
    brand: f.brand || p.vendor || "Unbranded",
    description: p.description,
    category: p.productType || "Clothing",
    gender: f.gender || "Unisex",
    style: list(f.style),
    condition: resolvedCondition,
    conditionNotes:
      f.condition_notes || "A pre-loved piece ready for its next chapter.",
    sizeLabel: f.label_size || "One size",
    measurements,
    color: f.color || "Not specified",
    material: f.material,
    price: Number(v.price.amount),
    currency: v.price.currencyCode,
    compareAtPrice: v.compareAtPrice
      ? Number(v.compareAtPrice.amount)
      : Number(v.price.amount) * 2,
    stock: v.availableForSale ? 1 : 0,
    images,
    defects: list(f.defects),
    tags: p.tags,
    collection: p.collections.nodes.map((c) => c.handle),
    createdAt: p.createdAt,
    era: f.era,
  };
}
async function getProducts() {
  let cursor: string | null = null;
  const products: Product[] = [];
  do {
    const data: {
      products: {
        nodes: ShopifyProduct[];
        pageInfo: { hasNextPage: boolean; endCursor: string };
      };
    } = await request(
      `query Products($cursor:String){products(first:100,after:$cursor,sortKey:CREATED_AT,reverse:true){nodes{${fields}}pageInfo{hasNextPage endCursor}}}`,
      { cursor },
    );
    products.push(...data.products.nodes.map(mapProduct));
    cursor = data.products.pageInfo.hasNextPage
      ? data.products.pageInfo.endCursor
      : null;
  } while (cursor);
  return products;
}
export const shopifyProvider: CommerceProvider = {
  mode: "shopify",
  getProducts,
  async getProductByHandle(handle) {
    const data = await request<{ product: ShopifyProduct | null }>(
      `query Product($handle:String!){product(handle:$handle){${fields}}}`,
      { handle },
    );
    return data.product ? mapProduct(data.product) : undefined;
  },
  async getCollections() {
    const data = await request<{
      collections: {
        nodes: {
          id: string;
          handle: string;
          title: string;
          description: string;
          image?: { url: string };
          products: { nodes: { id: string }[] };
        }[];
      };
    }>(
      `{collections(first:100){nodes{id handle title description image{url} products(first:250){nodes{id}}}}}`,
    );
    return data.collections.nodes.map(
      (c): Collection => ({
        id: c.id,
        handle: c.handle,
        title: c.title,
        description: c.description,
        image: c.image?.url,
        productIds: c.products.nodes.map((p) => p.id),
        isDrop: c.handle === process.env.SHOPIFY_NEW_DROP_HANDLE,
      }),
    );
  },
  async createCheckout(lines: CartInput[]) {
    const validated = validateCart(lines, await getProducts());
    if (!validated.length) throw new Error("Your bag is empty.");
    const data = await request<{
      cartCreate: {
        cart: { id: string; checkoutUrl: string } | null;
        userErrors: { message: string }[];
        warnings: { message: string }[];
      };
    }>(
      `mutation Cart($input:CartInput!){cartCreate(input:$input){cart{id checkoutUrl}userErrors{message}warnings{message}}}`,
      {
        input: {
          lines: validated.map((l) => ({
            merchandiseId: l.product.variantId,
            quantity: l.quantity,
          })),
        },
      },
    );
    if (data.cartCreate.userErrors.length || data.cartCreate.warnings?.length)
      throw new Error(
        [...data.cartCreate.userErrors, ...(data.cartCreate.warnings || [])]
          .map((e) => e.message)
          .join(" "),
      );
    if (!data.cartCreate.cart)
      throw new Error("Checkout could not be started.");
    return { checkoutUrl: data.cartCreate.cart.checkoutUrl };
  },
};
