# THRIFT VAULT

A standalone Next.js / TypeScript storefront for curated pre-loved fashion. Warm-white, near-black, acid-green art direction; original campaign imagery; responsive catalog, collections, product pages, saved pieces and bag.

## Run locally

Requires Node.js 20.9 or newer for the app; Node.js 22.18+ is recommended for the included TypeScript-strip test command. From this folder:

```sh
npm install
npm run dev
```

Open http://localhost:3000. Production: `npm run build` then `npm start`.

This Windows computer blocks the native SWC and Sharp modules through Application Control. The supported Webpack/WASM compiler is used without changing that security policy. Next/Image uses pre-generated responsive WebP assets locally and Shopify CDN transformations for live media; no Sharp runtime is necessary. An install with `npm install --ignore-scripts` was used on this machine. No security settings were modified.

## What works

- Editorial homepage, shop, admin-collection-driven drops, collection pages, archive, brand story, help/policy pages.
- Multi-term search, category/gender/brand/size/condition/color/style/availability/price filters and sorting. Twelve items per page with controlled load-more.
- Persistent device-local bag and wishlist, quick view, image zoom/swipe, stock-aware purchase controls.
- Garment measurements, cm/in toggle, measuring guide and garment-to-garment comparison.
- Product metadata, sharing, canonical URLs, robots and sitemap. Real product structured data only in live mode.
- Accessible Radix dialogs, focus handling, escape-to-close, reduced motion and mobile bottom-sheet filters/sticky purchase bar.
- Typed analytics events with no external tracker or credentials.

## Preview is not a live store

The default provider is `local`. All eight products, amounts, measurements, grades and stock values are SAMPLE DATA. Stock photos are illustrative, not photographs of stock owned by the business. The second image is transparently identified as a detail crop, not another original angle. The editorial hero is generated artwork. See `IMAGE-CREDITS.md` for stock sources and licensing.

Ordering/payment is disabled server-side. Newsletter enrollment is disabled until a real provider is configured. No fake orders, payment methods, customer reviews, brand authenticity guarantees, social posts, followers, shipping charges or return promises were added. No brand directory is shown when the inventory contains only unbranded sample items. No indexable product offers are emitted for samples; preview robots block indexing.

## Commerce boundary

`lib/commerce/types.ts` defines normalized products/collections/cart lines. Components use the provider/services and store context, never import fixture arrays. `local.ts` and `shopify.ts` implement the same provider contract. `products.ts`, `collections.ts`, `cart.ts`, `checkout.ts`, `customers.ts`, and `search.ts` expose the service boundary.

Copy `.env.example` to `.env.local`, then configure locally; never paste secret tokens into a client component or commit them.

```dotenv
COMMERCE_PROVIDER=shopify
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_PRIVATE_TOKEN=your-private-storefront-token
SHOPIFY_API_VERSION=2026-07
SHOPIFY_NEW_DROP_HANDLE=your-admin-created-drop-handle
NEXT_PUBLIC_SITE_URL=https://your-final-domain.example
```

The Shopify adapter is implemented but has not been tested against a real store because credentials/inventory were not supplied. It fetches server-side, refreshes availability without caching, validates required thrift metadata, re-reads stock at checkout, calls Shopify `cartCreate`, rejects errors/warnings, and redirects to its `checkoutUrl`. It never processes payments. Customer account access is an optional configured Shopify-hosted account URL, not a custom auth system.

### Inventory contract

Create ONE Shopify product with ONE variant for each distinct garment/size. Separate garments must not share a product. Track inventory; set actual stock; disable **Continue selling when out of stock**. Publish products to the headless sales channel and allow Storefront access to quantity and metafields.

Adding to a bag or creating a Storefront cart does NOT reserve inventory. This UI explicitly says so. Shopify checkout and its inventory settings are the authoritative overselling protection. Do not claim an earlier reservation; any business-required timed hold needs a separate verified backend/Shopify capability. The sample provider never accepts orders, so it cannot oversell.

Untracked/unknown Shopify quantity fails closed as unavailable. Price and availability always come from server-side product data at checkout, not client-provided amounts. One-off entries cannot be added twice. The UI revalidates inventory on focus and every 60 seconds; checkout always revalidates again. Final inventory competition is resolved by Shopify, not a frontend counter.

### Shopify metafields (`thrift` namespace)

Expose these definitions to Storefront API:

| Key                                  | Type                        | Notes                                             |
| ------------------------------------ | --------------------------- | ------------------------------------------------- |
| condition                            | single_line_text_field      | Required: Like new, Excellent, Very good, Good    |
| condition_notes                      | multi_line_text_field       | Required; disclose real wear                      |
| label_size                           | single_line_text_field      | Required                                          |
| brand                                | single_line_text_field      | Factual garment label; no invented authentication |
| gender, color, material, era         | single_line_text_field      | Omit unknown material/era                         |
| pit_to_pit, length, shoulder, sleeve | number_decimal              | Relevant flat garment dimensions in cm            |
| waist, rise, inseam, leg_opening     | number_decimal              | Relevant flat garment dimensions in cm            |
| style                                | list.single_line_text_field | Used for filters                                  |
| defects                              | list.single_line_text_field | Specific defects and photo references             |

At least one relevant measurement is required; include every useful dimension for the garment. Shopify `productType` maps to category, vendor is brand fallback, tags are searchable, images retain actual alt text, and collections supply editorial edits. The configured drop handle refers to an actual Shopify Admin collection. No date-based scarcity is synthesized.

Upload actual front/back/detail/tag/label/defect images. Add clear image alt text. Products with missing required metadata fail with a configuration error instead of receiving fabricated grading.

### Other settings

- `NEXT_PUBLIC_WHATSAPP_NUMBER`: real international digits only, without `+`; otherwise no WhatsApp link.
- `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_CUSTOMER_ACCOUNT_URL`: optional real destinations.
- `NEWSLETTER_ENDPOINT`: owner-controlled HTTPS service accepting `{email, source}` with an optional bearer `NEWSLETTER_API_KEY`. The endpoint must implement consent records, double opt-in if appropriate, unsubscribe and abuse/rate controls. The UI stays disabled until configured.
- Replace preview policies in `lib/settings.ts`, help FAQ/terms, and support text with approved operating policies before launch. Configure actual shipping and payment methods in Shopify.
- Analytics emits `thrift-vault:analytics` browser CustomEvents only. Add consent-aware listeners to connect a real provider. Verified purchase events must come from completed Shopify checkout/webhooks, not a button click.

## Verification

```sh
npm run typecheck
npm run lint
npm test
npm run test:browser
npm run build
```

Browser QA uses installed Microsoft Edge headlessly and checks the six requested widths, key shopping interactions, images, routes, console errors and horizontal overflow. Start the dev server first or set `QA_BASE_URL` to the target preview. Screenshots and reports go to ignored `work/qa/`.

## Launch checklist

1. Replace sample catalog with live Shopify inventory and actual item photography.
2. Supply the real domain, Storefront access, collection handle, and exposed metafields.
3. Confirm tracked inventory with overselling disabled; test concurrent checkout/sold-out behavior in the connected store.
4. Approve and publish shipping, returns, terms, privacy and authenticity wording.
5. Enable only real support/social/newsletter/account destinations.
6. Test the configured payment methods, shipping, tax, order notifications, and an end-to-end Shopify test order.
7. Deploy to a Next.js-compatible host. No public deployment was performed; the requested local site is the current deliverable.

References: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [Shopify Storefront carts](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage).
