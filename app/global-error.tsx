"use client";
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#f4f2ec",
          color: "#0a0a0a",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <main style={{ maxWidth: 650, margin: "15vh auto", padding: 30 }}>
          <p>THRIFT VAULT</p>
          <h1 style={{ fontSize: 48, lineHeight: 1 }}>A SHORT PAUSE.</h1>
          <p>We couldn’t load the store. Please try again in a moment.</p>
          <button
            onClick={reset}
            style={{
              padding: "16px 24px",
              background: "#0a0a0a",
              color: "#f4f2ec",
              border: 0,
              cursor: "pointer",
            }}
          >
            TRY AGAIN →
          </button>
        </main>
      </body>
    </html>
  );
}
