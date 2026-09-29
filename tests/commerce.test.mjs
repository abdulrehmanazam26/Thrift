import test from "node:test";
import assert from "node:assert/strict";
import { validateCart, addToCart } from "../lib/commerce/cart.ts";
import { filterProducts } from "../lib/commerce/search.ts";
import { sampleProducts } from "../lib/commerce/local-data.ts";
test("one-off products cannot be added twice", () => {
  const p = sampleProducts[0];
  const cart = addToCart([], p);
  assert.deepEqual(addToCart(cart, p), cart);
});
test("sold products cannot be added or validated", () => {
  const p = sampleProducts.find((p) => p.stock === 0);
  assert.throws(() => addToCart([], p), /gone/);
  assert.throws(
    () => validateCart([{ productId: p.id, quantity: 1 }], sampleProducts),
    /no longer/,
  );
});
test("checkout rejects duplicate product IDs and inflated quantities", () => {
  const p = sampleProducts[0];
  assert.throws(
    () =>
      validateCart(
        [
          { productId: p.id, quantity: 1 },
          { productId: p.id, quantity: 1 },
        ],
        sampleProducts,
      ),
    /already/,
  );
  for (const quantity of [0, -1, 2, 1.5])
    assert.throws(() =>
      validateCart([{ productId: p.id, quantity }], sampleProducts),
    );
});
test("checkout uses provider price, not client input", () => {
  const lines = validateCart(
    [{ productId: sampleProducts[0].id, quantity: 1, price: 1 }],
    sampleProducts,
  );
  assert.equal(lines[0].product.price, 4250);
});
test("checkout rejects removed inventory", () =>
  assert.throws(
    () => validateCart([{ productId: "gone", quantity: 1 }], sampleProducts),
    /no longer listed/,
  ));
test("multi-term and size-alias searches", () => {
  assert.equal(
    filterProducts(sampleProducts, { query: "charcoal large hoodie" }).length,
    1,
  );
  assert.equal(
    filterProducts(sampleProducts, { query: "white tee" }).length,
    1,
  );
  assert.equal(
    filterProducts(sampleProducts, { query: "impossible find" }).length,
    0,
  );
});
test("filters combine without hiding unisex garments", () => {
  const results = filterProducts(sampleProducts, {
    gender: "Men",
    category: "Jackets",
    availability: "available",
  });
  assert.equal(results.length, 2);
  assert.ok(results.every((p) => p.stock > 0));
});
test("sorts prices and separates sold archive", () => {
  const results = filterProducts(sampleProducts, { sort: "price-low" });
  assert.equal(results[0].price, 1850);
  assert.ok(
    filterProducts(sampleProducts, { availability: "sold" }).every(
      (p) => p.stock === 0,
    ),
  );
});
