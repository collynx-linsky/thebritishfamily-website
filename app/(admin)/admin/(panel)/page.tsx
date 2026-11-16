import type { Metadata } from "next";
import { SignOutOtherDevices } from "@/components/admin/SignOutOtherDevices";
import { verifySession } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Dashboard" };

/** Placeholder dashboard: the full dashboard arrives in the next step. */
export default async function DashboardPage() {
  const session = await verifySession();
  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-5 py-10">
      <h1 className="text-3xl font-bold text-navy">Dashboard</h1>
      <p className="mt-2 text-muted">Signed in as {session.email}.</p>
      <section aria-labelledby="security-title" className="mt-8 max-w-xl rounded-lg border border-line bg-white p-6">
        <h2 id="security-title" className="text-lg font-bold text-navy">
          Security
        </h2>
        <p className="mt-1 mb-4 text-sm text-muted">
          If you signed in on a shared or lost device, sign out everywhere else.
        </p>
        <SignOutOtherDevices />
      </section>
    </main>
  );
}
