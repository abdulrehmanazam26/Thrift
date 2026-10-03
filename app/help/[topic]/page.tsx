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
        text: "A grade is a summary. The product’s photographs, measurements, and condition notes tell the fuller story. Ask us for missing details before ordering.",
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
        text: "Enter a Karachi address and pay cash on delivery. The Rs 250 delivery fee and full order total are shown before you place the order.",
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
        text: "Please contact us promptly if your delivered item differs from its listing. The detailed return eligibility and timeframe are awaiting owner approval.",
      },
    ],
  },
  privacy: {
    title: "YOUR PRIVACY.",
    intro: "How your information is used in this store.",
    sections: [
      { heading: "Device storage", text: settings.policies.privacy },
      {
        heading: "Clearing saved information",
        text: "You can remove pieces from your bag and wishlist, or clear this site’s browser storage to remove both. No customer account is created.",
      },
      {
        heading: "Orders and support",
        text: "Checkout is handled on this website. Order details are stored in our private store database. WhatsApp or social links, if used, have their own privacy practices.",
      },
    ],
  },
  terms: {
    title: "THE STORE TERMS.",
    intro: "Important information before ordering.",
    sections: [
      { heading: "Preview terms", text: settings.policies.terms },
      {
        heading: "Photography",
        text: "Campaign imagery is editorial. Check each product listing for its own photos and condition information; a label or photograph does not establish authentication.",
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
        text: "No. Your bag records your selection but does not reserve inventory. Availability is checked when you place the order.",
      },
      {
        heading: "Can I place an order now?",
        text: "Karachi COD ordering is available when the store owner opens checkout. If checkout is paused, you can still browse the catalog.",
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
