import Link from "next/link";
import { settings } from "@/lib/settings";
export const metadata = {
  title: "Get in Touch",
  alternates: { canonical: "/contact" },
};
export default function Page() {
  return (
    <section className="section simple-page">
      <p className="eyebrow">LET’S TALK ABOUT YOUR NEXT FIND</p>
      <h1>
        GOOD TO
        <br />
        HEAR FROM YOU.
      </h1>
      <p>
        Questions about a piece, its measurements, or its condition? Our support
        channels will appear here as soon as they’re ready.
      </p>
      {settings.email && (
        <a className="button dark" href={`mailto:${settings.email}`}>
          EMAIL THRIFT VAULT ↗
        </a>
      )}
      {/^\d{8,15}$/.test(settings.whatsapp) && (
        <a
          className="button dark"
          href={`https://wa.me/${settings.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          WHATSAPP SUPPORT ↗
        </a>
      )}
      {!settings.email && !settings.whatsapp && (
        <p className="preview-note">
          Direct support will open with the first live drop.
        </p>
      )}
      <Link className="text-link" href="/help/faq">
        EXPLORE COMMON QUESTIONS ↗
      </Link>
    </section>
  );
}
