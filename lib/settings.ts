export const settings = {
  name: "THRIFT VAULT",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
  // Owner must approve full terms/returns/privacy text before opening checkout.
  policies: {
    shipping:
      "Cash on delivery is available within Karachi only. Delivery is Rs 250 per order across Karachi. We will contact you to confirm the order and delivery details.",
    returns:
      "Our detailed returns policy is awaiting owner approval. Please ask about any piece, its measurements, or condition before ordering; contact us promptly if an item differs from its listing.",
    privacy:
      "Your bag and saved pieces stay on this device. When you place an order, we collect your name, phone, address, optional email and order details to arrange delivery and support. We do not collect card details. A complete privacy policy is awaiting owner approval.",
    terms:
      "Orders are subject to availability and confirmation by the store. Prices are in PKR. Karachi cash-on-delivery shipping is Rs 250 per order. Full store terms are awaiting owner approval.",
  },
};
