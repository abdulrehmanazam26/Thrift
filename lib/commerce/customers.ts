import { settings } from "@/lib/settings";
export function getCustomerAccountUrl() {
  return settings.customerAccountUrl || null;
}
