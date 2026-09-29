import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { settings } from "@/lib/settings";
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <Link className="wordmark" href="/">
            <span className="brand-lockup footer-lockup">
              <span className="brand-thrift">THRIFT</span>
              <span className="brand-urdu" lang="ur" dir="rtl">کرو</span>
            </span>
          </Link>
          <p>Old soul. New energy. All you.</p>
          <span className="eyebrow">CURATED PRE-LOVED FASHION</span>
        </div>
        <div>
          <h3>EXPLORE</h3>
          {[
            ["Shop all", "/shop"],
            ["New drop", "/new-drop"],
            ["Collections", "/collections"],
            ["The archive", "/archive"],
          ].map(([label, url]) => (
            <Link href={url} key={url}>
              {label}
            </Link>
          ))}
        </div>
        <div>
          <h3>GOOD TO KNOW</h3>
          {[
            ["Sizing guide", "/help/sizing"],
            ["Condition guide", "/help/condition"],
            ["Shipping", "/help/shipping"],
            ["Returns", "/help/returns"],
            ["FAQs", "/help/faq"],
          ].map(([label, url]) => (
            <Link href={url} key={url}>
              {label}
            </Link>
          ))}
        </div>
        <div>
          <h3>THRIFT VAULT</h3>
          <Link href="/about">Our story</Link>
          <Link href="/contact">Get in touch</Link>
          <Link href="/wishlist">Your saved pieces</Link>
          {settings.instagram && (
            <a
              href={settings.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram <ArrowUpRight size={12} />
            </a>
          )}
        </div>
      </div>
      <div className="footer-wordmark" aria-hidden="true">
        THRIFT <span className="footer-urdu" lang="ur" dir="rtl">کرو</span>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} THRIFT VAULT</span>
        <span>WEAR WHAT OTHERS WON’T FIND.</span>
        <div>
          <Link href="/help/privacy">Privacy</Link>
          <Link href="/help/terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
