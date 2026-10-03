// Read-only migration helper. Prints public catalog data; never logs credentials.
const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
if (!domain || !token) throw new Error("Shopify read-only settings are missing");

const query = `query Catalog($after: String) {
  products(first: 100, after: $after) {
    nodes {
      id handle title description vendor productType tags createdAt
      images(first: 10) { nodes { url altText } }
      variants(first: 2) { nodes { id availableForSale price { amount currencyCode } compareAtPrice { amount } } }
      collections(first: 20) { nodes { handle } }
    }
    pageInfo { hasNextPage endCursor }
  }
}`;

const products = [];
let after = null;
do {
  const response = await fetch(`https://${domain}/api/${process.env.SHOPIFY_API_VERSION || "2026-07"}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
    body: JSON.stringify({ query, variables: { after } }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
  const payload = await response.json();
  if (payload.errors?.length) throw new Error(payload.errors.map((error) => error.message).join("; "));
  products.push(...payload.data.products.nodes);
  after = payload.data.products.pageInfo.hasNextPage ? payload.data.products.pageInfo.endCursor : null;
} while (after);
console.log(JSON.stringify(products, null, 2));
