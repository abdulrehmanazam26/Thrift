"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { track } from "@/lib/analytics";
export function Newsletter({ enabled }: { enabled: boolean }) {
  const [email, setEmail] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <section className="newsletter section">
      <div>
        <p className="eyebrow">FIRST IN LINE</p>
        <h2>GET THE DROP FIRST.</h2>
        <p>New pieces don’t wait around.</p>
      </div>
      <div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
              });
              const result = await res.json();
              setMessage(result.message || result.error);
              if (res.ok) {
                track("newsletter");
                setEmail("");
              }
            } catch {
              setMessage("Couldn’t reach the list. Please try again.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="sr-only" htmlFor="newsletter-email">
            Email address
          </label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            required
            maxLength={254}
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!enabled}
          />
          <button disabled={!enabled || busy} aria-label="Join the newsletter">
            {busy ? "JOINING…" : "JOIN THE LIST"}
            <ArrowRight size={19} />
          </button>
        </form>
        <p className="small muted" role="status">
          {message ||
            (enabled
              ? "By joining, you agree to receive drop emails. Unsubscribe anytime."
              : "The list opens with our first live drop. Stay close.")}
        </p>
      </div>
    </section>
  );
}
