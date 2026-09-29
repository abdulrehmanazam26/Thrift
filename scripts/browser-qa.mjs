import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.QA_BASE_URL || "http://localhost:3000";
const output = "work/qa";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
const errors = [];
const report = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (msg) => {
  if (msg.type() === "error" && !/status of (409|404)/.test(msg.text()))
    errors.push(msg.text());
});
async function go(path) {
  const response = await page.goto(base + path, { waitUntil: "networkidle" });
  assert.equal(response.status(), 200, path);
  await page
    .locator('html[data-store-ready="true"]')
    .waitFor({ timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
}
async function noOverflow(name) {
  const sizes = await page.evaluate(() => ({
    viewport: innerWidth,
    body: document.body.scrollWidth,
    root: document.documentElement.scrollWidth,
  }));
  assert.ok(
    sizes.body <= sizes.viewport + 1 && sizes.root <= sizes.viewport + 1,
    `${name}: overflow ${JSON.stringify(sizes)}`,
  );
}
try {
  for (const [width, height] of [
    [1440, 900],
    [1280, 800],
    [1024, 768],
    [768, 1024],
    [430, 932],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    for (const route of ["/", "/shop", "/products/washed-denim-jacket"]) {
      await go(route);
      await noOverflow(`${width} ${route}`);
      if (width === 1440 || width === 390) {
        await page.evaluate(async () => {
          await Promise.all(
            [...document.images].map((im) => {
              im.loading = "eager";
              return im.decode().catch(() => {});
            }),
          );
        });
        await page.screenshot({
          path: `${output}/${width}-${route === "/" ? "home" : route === "/shop" ? "shop" : "product"}.png`,
          fullPage: route !== "/",
          caret: "initial",
        });
      }
    }
    report.push({ viewport: `${width}x${height}`, routes: 3, overflow: false });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await go("/shop");
  await page.locator("#desktop-category").selectOption("Hoodies");
  await page.waitForURL("**/shop?category=Hoodies");
  await assert.doesNotReject(() =>
    page
      .getByRole("link", { name: "The everyday hoodie", exact: true })
      .waitFor(),
  );
  assert.equal(await page.locator(".catalog-grid .product-card").count(), 1);
  await page.locator(".filter-heading button").click();
  await page.waitForURL("**/shop");
  await page.locator(".product-card").first().hover();
  await page
    .getByRole("button", { name: "QUICK VIEW", exact: true })
    .first()
    .click();
  await page.getByRole("dialog").waitFor();
  await page.getByRole("button", { name: "ADD TO BAG", exact: false }).click();
  await page.getByRole("heading", { name: "YOUR BAG (1)" }).waitFor();
  await page.getByRole("button", { name: "CHECKOUT", exact: true }).click();
  await page.getByRole("alert").filter({ hasText: "preview" }).waitFor();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Open bag, 1 pieces" }).waitFor();
  await page
    .getByRole("button", {
      name: "Save The washed denim jacket to wishlist",
      exact: true,
    })
    .click();
  await go("/wishlist");
  assert.equal(await page.locator(".product-card").count(), 1);
  await go("/products/washed-denim-jacket");
  await page.getByRole("button", { name: "HOW TO MEASURE" }).click();
  await page.getByLabel("Chest", { exact: true }).fill("55");
  assert.ok(
    (await page.getByRole("dialog").innerText()).includes("3.0 cm larger"),
  );
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "IN", exact: true }).click();
  assert.ok(
    (await page.locator(".measurements").innerText()).includes("22.8 in"),
  );
  await page.getByRole("button", { name: "Zoom Editorial preview" }).click();
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Search the Vault" }).click();
  await page
    .getByRole("textbox", { name: "Search products" })
    .fill("charcoal hoodie");
  assert.equal(await page.locator(".search-results .product-card").count(), 1);
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await go("/shop");
  await page.getByRole("button", { name: /FILTER & SORT/ }).click();
  await page.locator("#mobile-category").selectOption("Hoodies");
  await page.getByRole("button", { name: /VIEW 1 ITEMS/ }).click();
  assert.equal(await page.locator(".catalog-grid .product-card").count(), 1);
  await page.getByRole("button", { name: "Open menu" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "ABOUT" })
    .click();
  await page.waitForURL("**/about");
  for (const route of [
    "/new-drop",
    "/collections",
    "/collections/denim-edit",
    "/archive",
    "/products/tailored-neutral-trousers",
    "/about",
    "/contact",
    "/account",
    "/help/sizing",
    "/help/condition",
    "/help/shipping",
    "/help/returns",
    "/help/faq",
    "/help/privacy",
    "/help/terms",
  ]) {
    await go(route);
    await noOverflow(route);
  }
  await go("/products/tailored-neutral-trousers");
  assert.equal(
    await page
      .getByRole("button", { name: "ADD TO BAG", exact: false })
      .count(),
    0,
  );
  assert.ok(
    await page
      .getByRole("link", { name: "FIND SOMETHING SIMILAR" })
      .isVisible(),
  );
  const missing = await page.goto(base + "/products/not-a-piece");
  // Next.js streamed not-found responses can be 200; the not-found UI and
  // robots=noindex are the required semantics in that case.
  assert.ok([200,404].includes(missing.status()));
  await page.getByRole('heading',{name:/GOT AWAY/}).waitFor();
  assert.ok(await page.locator('meta[name="robots"]').evaluateAll(nodes=>nodes.some(node=>node.content.includes('noindex'))));
  await go("/");
  const imageStatus = await page.evaluate(async () => {
    const images = [...document.images];
    await Promise.all(
      images.map((im) => {
        im.loading = "eager";
        return im.decode().catch(() => {});
      }),
    );
    return images.filter((im) => !im.naturalWidth).map((im) => im.src);
  });
  assert.deepEqual(imageStatus, [], "broken images");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForLoadState('networkidle');
  await page.screenshot({
    path: `${output}/home-full.png`,
    fullPage: true,
    caret: "initial",
  });
  const crossOrigin = await context.request.post(base + "/api/checkout", {
    headers: { Origin: "https://untrusted.example" },
    data: { lines: [{ productId: "sample-1", quantity: 1 }] },
  });
  assert.equal(crossOrigin.status(), 403, "cross-origin mutation blocked");
  assert.deepEqual([...new Set(errors)], [], "browser errors");
  report.push({
    interactions:
      "filters, quick view, cart persistence, preview checkout, wishlist, measurements, zoom, search, mobile filters and navigation, sold-out guard, 404, images",
    status: "passed",
  });
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  await page.screenshot({ path: `${output}/failure.png`, fullPage: true });
  console.error("URL:", page.url());
  console.error("Console:", JSON.stringify(errors));
  throw error;
} finally {
  await browser.close();
}
