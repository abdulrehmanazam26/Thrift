import type { Metadata } from "next";
import { adminConfigured, isAdmin } from "@/lib/admin/auth";
import { databaseConfigured } from "@/lib/custom-store/db";
import { AdminPanel } from "./AdminPanel";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function AdminPage() {
  const demoMode =
    process.env.NODE_ENV === "development" && !databaseConfigured();
  const ready = adminConfigured() && (databaseConfigured() || demoMode);

  return (
    <div data-admin-page="true">
      {ready ? (
        <AdminPanel authenticated={await isAdmin()} demoMode={demoMode} />
      ) : (
        <div style={{ maxWidth: 600, margin: "10vh auto", padding: 32 }}>
          <h1>Admin setup needed</h1>
          <p>
            Private admin credentials must be configured before this panel can
            open.
          </p>
        </div>
      )}
    </div>
  );
}
