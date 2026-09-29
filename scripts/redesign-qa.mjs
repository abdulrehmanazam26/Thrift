import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const base = process.env.QA_BASE_URL || "http://localhost:3001";
const output = "work/qa-redesign";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ reducedMotion: "reduce" });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const report = [];
try {
  for (const width of [1440, 1280, 1024, 768, 430, 390, 360, 320]) {
    await page.setViewportSize({ width, height: width > 700 ? 900 : 844 });
    await page.goto(base, { waitUntil: "networkidle", timeout: 120000 });
    await page.locator('html[data-store-ready="true"]').waitFor();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((image) => {
        image.loading = "eager";
        return image.decode().catch(() => {});
      }));
    });
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const dimensions = await page.evaluate(() => ({
      viewport: innerWidth,
      body: document.body.scrollWidth,
      root: document.documentElement.scrollWidth,
      broken: [...document.images].filter((image) => !image.naturalWidth).map((image) => image.src),
      headingFont: getComputedStyle(document.querySelector("h1")).fontFamily,
      overflow: [...document.querySelectorAll("body *")].filter((el) => {
        const rect = el.getBoundingClientRect();
        if (el.closest('[class*="editGrid"]')) return false;
        return rect.width > 0 && (rect.right > innerWidth + 2 || rect.left < -2);
      }).slice(0, 15).map((el) => ({ tag: el.tagName, className: el.className })),
    }));
    report.push({ width, ...dimensions });
    await page.screenshot({ path: `${output}/home-${width}.png`, fullPage: width === 1440 || width === 390, caret: "initial" });
    if (width === 1440 || width === 390) await page.screenshot({ path: `${output}/hero-${width}.png`, caret: "initial" });
    assert.ok(dimensions.body <= width + 1 && dimensions.root <= width + 1, JSON.stringify(report));
    assert.deepEqual(dimensions.broken, []);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const editGrid = page.locator('[class*="editGrid"]').first();
  const initialScroll = await editGrid.evaluate((el) => el.scrollLeft);
  await editGrid.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
  await page.waitForFunction(() => document.querySelector('[class*="editGrid"]').scrollLeft > 0);
  assert.equal(initialScroll, 0);
  await page.getByRole("link", { name: "ENTER THE VAULT", exact: true }).click();
  await page.waitForURL("**/shop");
  await page.goBack({ waitUntil: "networkidle" });
  await page.getByRole("link", { name: "DISCOVER THE EDIT", exact: true }).click();
  await page.waitForURL("**/new-drop");
  assert.deepEqual(errors, []);
  await writeFile(`${output}/report.json`, JSON.stringify({ viewports: report, errors, homepageLinks: "passed", mobileCollectionScroll: "passed" }, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }
