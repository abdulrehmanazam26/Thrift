import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty-state">
      <p className="eyebrow">404 / A LITTLE OFF THE RACK</p>
      <h1>
        THIS ONE
        <br />
        GOT AWAY.
      </h1>
      <p>We couldn’t find that page. There’s still plenty to discover.</p>
      <Link className="button dark" href="/shop">
        BACK TO THE VAULT →
      </Link>
    </div>
  );
}
