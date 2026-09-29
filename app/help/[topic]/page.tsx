import Link from "next/link";
import { notFound } from "next/navigation";
import { settings } from "@/lib/settings";
const pages: Record<
  string,
  {
    title: string;
    intro: string;
    sections: { heading: string; text: string }[];
  }
> = {
  sizing: {
    title: "FIND YOUR FIT.",
    intro:
      "The label is only a starting point. Your favorite clothes are a better reference.",
    sections: [
      {
        heading: "Start with a piece you already wear",
        text: "Lay a similar garment flat on a smooth surface. Fasten any buttons or zip. Smooth the fabric gently without stretching it. Compare the measurements with the product page.",
      },
      {
        heading: "Tops, shirts & jackets",
        text: "Chest / pit-to-pit: measure straight across from one armpit to the other. Length: measure from the top of the shoulder to the hem. Shoulder: measure across the back between shoulder seams. Sleeve: measure from the shoulder seam to the cuff.",
      },
      {
        heading: "Jeans & trousers",
        text: "Waist: measure across the fastened waistband. Rise: measure from crotch seam to waistband. Inseam: measure from the crotch seam down to the leg hem. Leg opening: measure straight across the hem. Measurements are flat widths, not body circumferences.",
      },
      {
        heading: "Compare, don’t guess",
        text: "Product measurements use centimeters, with an inch toggle available. Enter your own garment’s measurements in the product-page fit guide to compare. Garment cut, stretch, and measuring technique can affect fit; the comparison is guidance, not a guarantee.",
      },
    ],
  },
  condition: {
    title: "CHARACTER, EXPLAINED.",
    intro:
      "Pre-loved pieces have a past. Here’s how to read the condition grades.",
    sections: [
      {
        heading: "01 / Like new",
        text: "Little to no visible wear. This grade describes the garment’s condition, not whether it is new or unworn.",
      },
      {
        heading: "02 / Excellent",
        text: "Light signs of wear. Any specific marks, fading, or other notable details belong in the individual item’s condition notes.",
      },
      {
        heading: "03 / Very good",
        text: "Visible but moderate wear, such as light pilling or fading. Check the condition notes and photographs for the details of that particular piece.",
      },
      {
        heading: "04 / Good",
        text: "Noticeable wear, with useful life left. Marks, repairs, or other known flaws should be listed clearly on the product page.",
      },
      {
        heading: "Always look at the individual piece",
        text: "A grade is a summary. The product’s photographs, measurements, and condition notes tell the fuller story. Preview items currently use sample information; actual details will be provided with live inventory.",
      },
    ],
  },
  shipping: {
    title: "DELIVERY DETAILS.",
    intro: "The last part of a good find: getting it to you.",
    sections: [
      { heading: "Shipping policy", text: settings.policies.shipping },
      {
        heading: "At checkout",
        text: "When ordering opens, eligible destinations and delivery rates will be shown by the connected checkout. Only the payment methods actually enabled by the store will appear.",
      },
    ],
  },
  returns: {
    title: "LET’S MAKE IT CLEAR.",
    intro: "Clear expectations make for better second chapters.",
    sections: [
      { heading: "Returns policy", text: settings.policies.returns },
      {
        heading: "Before choosing your piece",
        text: "Read the condition notes and compare the garment measurements with clothing you own. Known wear and defects will be disclosed on each live product page.",
      },
      {
        heading: "Condition and fit concerns",
        text: "The final policy will explain how to report an item that differs from its listing and whether fit-related returns are accepted. No final eligibility rules are implied by this preview.",
      },
    ],
  },
  privacy: {
    title: "YOUR PRIVACY.",
    intro: "Straightforward information about this preview.",
    sections: [
      { heading: "Device storage", text: settings.policies.privacy },
      {
        heading: "Clearing saved information",
        text: "You can remove pieces from your bag and wishlist, or clear this site’s browser storage to remove both. No customer account is created by using the preview.",
      },
      {
        heading: "External checkout and support",
        text: "If external checkout, WhatsApp, or social links are enabled, those services apply their own privacy practices. We will publish our complete data handling details before opening orders.",
      },
    ],
  },
  terms: {
    title: "THE STORE TERMS.",
    intro: "This storefront is currently a preview.",
    sections: [
      { heading: "Preview terms", text: settings.policies.terms },
      {
        heading: "Photography",
        text: "The campaign image is an AI-generated editorial concept. Catalog imagery is licensed stock photography used to demonstrate the store design. It does not represent inventory, authentication, or endorsement.",
      },
    ],
  },
  faq: {
    title: "GOOD QUESTIONS.",
    intro: "A few things worth knowing before you find your next piece.",
    sections: [
      {
        heading: "What does pre-loved mean?",
        text: "A garment that has been owned before. Condition varies by piece, which is why individual notes and photographs matter.",
      },
      {
        heading: "What does 1 of 1 mean?",
        text: "The label appears when a product’s recorded available stock is exactly one. It does not claim that no similar garment exists elsewhere.",
      },
      {
        heading: "Does adding an item to my bag reserve it?",
        text: "No. Your bag records your selection but does not reserve inventory. When live ordering opens, availability will be checked again at checkout.",
      },
      {
        heading: "Can I place an order now?",
        text: "Not in the preview. The sample catalog lets you explore the shopping experience, but payment and ordering are not open yet.",
      },
      {
        heading: "Can I rely on the size label?",
        text: "Use it as a starting point. Check garment measurements and compare them with a similar piece you already wear.",
      },
      {
        heading: "Are branded pieces authenticated?",
        text: "No authentication claim is made unless the listing explicitly describes a real authentication process. Labels alone are not a guarantee.",
      },
    ],
  },
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  return {
    title: pages[topic]?.title || "Help",
    alternates: { canonical: `/help/${topic}` },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  const page = pages[topic];
  if (!page) notFound();
  return (
    <section className="section help-page">
      <div className="breadcrumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>Good to know</span>
      </div>
      <p className="eyebrow">THE DETAILS MATTER</p>
      <h1>{page.title}</h1>
      <p className="help-intro">{page.intro}</p>
      <div className="help-layout">
        <nav aria-label="Help topics">
          {Object.entries(pages).map(([key]) => (
            <Link
              key={key}
              className={key === topic ? "active" : ""}
              href={`/help/${key}`}
            >
              {key === "faq"
                ? "FAQs"
                : key.charAt(0).toUpperCase() + key.slice(1)}
            </Link>
          ))}
          <Link href="/contact">Get in touch ↗</Link>
        </nav>
        <div>
          {page.sections.map((s) => (
            <section key={s.heading}>
              <h2>{s.heading}</h2>
              <p>{s.text}</p>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
