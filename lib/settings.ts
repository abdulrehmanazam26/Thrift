export const settings = {
  name: "THRIFT VAULT",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
  customerAccountUrl: process.env.NEXT_PUBLIC_CUSTOMER_ACCOUNT_URL || "",
  // Publish owner-approved policy copy here before opening orders.
  policies: {
    shipping:
      "Delivery destinations, rates, and dispatch times will be published here before orders open. No shipping charge is collected in this preview.",
    returns:
      "Our returns policy is being finalized. Eligibility, time limits, and the process for condition or fit concerns will be published before orders open.",
    privacy:
      "This preview stores your saved pieces and bag on this device. Newsletter sign-up is currently unavailable. No payment information is collected. A complete privacy policy will be published before launch.",
    terms:
      "This is a storefront preview. Products, prices, measurements, and photographs in the preview catalog are illustrative and are not offers for sale. Store terms will be published before launch.",
  },
};
