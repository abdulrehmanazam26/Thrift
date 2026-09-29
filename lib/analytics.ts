export type AnalyticsEvent =
  | "product_view"
  | "search"
  | "filter"
  | "wishlist"
  | "quick_view"
  | "add_to_cart"
  | "checkout"
  | "purchase"
  | "whatsapp"
  | "newsletter"
  | "sold_product_interest";
// No tracker is installed. A consent-aware integration can subscribe to these events.
export function track(
  event: AnalyticsEvent,
  data: Record<string, unknown> = {},
) {
  if (typeof window !== "undefined")
    window.dispatchEvent(
      new CustomEvent("thrift-vault:analytics", { detail: { event, ...data } }),
    );
}
