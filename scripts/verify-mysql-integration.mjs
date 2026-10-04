import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

const baseUrl = process.env.QA_BASE_URL || "http://localhost:3001";
const username = process.env.ADMIN_USERNAME;
const secret = process.env.ADMIN_SESSION_SECRET;
const passwordHash = process.env.ADMIN_PASSWORD_HASH;

assert.ok(username && secret && passwordHash, "Admin environment is incomplete.");
const expiry = Date.now() + 60_000;
const payload = `${username}.${expiry}`;
const mac = createHmac("sha256", `${secret}:${passwordHash}`).update(payload).digest("hex");
const headers = {
  Cookie: `thrift_admin_session=${payload}.${mac}`,
  Origin: baseUrl,
  "Content-Type": "application/json",
};

const overviewResponse = await fetch(`${baseUrl}/api/admin/overview`, { headers });
assert.equal(overviewResponse.status, 200, "Admin overview must be available.");
const overview = await overviewResponse.json();
assert.equal(overview.products.length, 11, "Catalog seed must be visible in admin.");
const product = overview.products.find((item) => item.handle === "zara-basic-piece-4");
assert.ok(product, "Known catalog product is missing.");

const saveResponse = await fetch(`${baseUrl}/api/admin/products`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    id: product.id,
    handle: product.handle,
    title: product.title,
    brand: product.brand,
    description: product.description,
    category: product.category,
    gender: product.gender,
    condition: product.condition,
    conditionNotes: product.condition_notes,
    sizeLabel: product.size_label,
    color: product.color,
    price: Number(product.price),
    compareAtPrice: product.compare_at_price === null ? null : Number(product.compare_at_price),
    stock: Number(product.stock),
    imageUrls: product.images.map((image) => image.src),
    isActive: product.is_active,
  }),
});
assert.equal(saveResponse.status, 200, "Admin product save must succeed.");

const settingsResponse = await fetch(`${baseUrl}/api/admin/settings`, {
  method: "PATCH",
  headers,
  body: JSON.stringify({ checkoutEnabled: true }),
});
assert.equal(settingsResponse.status, 200, "Checkout setting must save.");

const catalogResponse = await fetch(`${baseUrl}/api/commerce`);
assert.equal(catalogResponse.status, 200, "Storefront catalog must be available.");
const catalog = await catalogResponse.json();
assert.equal(catalog.mode, "custom");
assert.ok(catalog.products.some((item) => item.handle === product.handle && item.images.length > 0));

const checkoutResponse = await fetch(`${baseUrl}/checkout`);
assert.equal(checkoutResponse.status, 200, "Checkout page must be available.");

console.log(JSON.stringify({
  products: catalog.products.length,
  adminSave: true,
  checkoutEnabled: true,
  storefront: "connected",
}));
