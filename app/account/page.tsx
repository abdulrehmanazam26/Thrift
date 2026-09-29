import Link from "next/link";
import { getCustomerAccountUrl } from "@/lib/commerce/customers";
export const metadata = {
  title: "Your Account",
  robots: { index: false, follow: true },
};
export default function Page() {
  const url = getCustomerAccountUrl();
  return (
    <section className="section simple-page">
      <p className="eyebrow">YOUR THRIFT VAULT</p>
      <h1>WELCOME BACK.</h1>
      {url ? (
        <>
          <p>
            Sign in to the secure customer portal to manage your orders and
            account.
          </p>
          <a href={url} className="button dark">
            SIGN IN TO YOUR ACCOUNT ↗
          </a>
        </>
      ) : (
        <>
          <p>
            Accounts will open with our first live drop. For now, your bag and
            saved pieces stay on this device.
          </p>
          <Link className="button dark" href="/wishlist">
            YOUR SAVED PIECES ↗
          </Link>
        </>
      )}
    </section>
  );
}
