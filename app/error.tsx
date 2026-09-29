"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty-state">
      <p className="eyebrow">A SHORT PAUSE</p>
      <h1>
        LET’S TRY
        <br />
        THAT AGAIN.
      </h1>
      <p>The store couldn’t load this page. Please try again in a moment.</p>
      <button className="button dark" onClick={reset}>
        TRY AGAIN →
      </button>
    </div>
  );
}
