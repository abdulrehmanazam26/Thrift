import { settings } from "./settings";
// Compare with the configured public origin, not Next's internal 0.0.0.0 listener.
// Never trust an arbitrary forwarded Host header to authorize a mutation.
export function isStoreOrigin(request: Request) {
  return request.headers.get("origin") === new URL(settings.siteUrl).origin;
}
