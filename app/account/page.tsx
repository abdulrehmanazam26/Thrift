import Link from "next/link";
export const metadata = {
  title: "Your Account",
  robots: { index: false, follow: true },
};
export default function Page() {
  return (
    <section className="section simple-page">
      <p className="eyebrow">YOUR THRIFT VAULT</p>
      <h1>WELCOME BACK.</h1>
      <p>Your bag and saved pieces stay on this device. Order confirmation appears after checkout; customer accounts are not available yet.</p>
      <Link className="button dark" href="/wishlist">YOUR SAVED PIECES ↗</Link>
    </section>
  );
}
