import Link from "next/link";
import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Page not found" };

/** Friendly "not found" inside the admin panel (real admin routes take priority). */
export default async function AdminMissingPage() {
  await verifySession();
  return (
    <main id="main" className="outline-none" tabIndex={-1}>
      <h1 className="text-3xl font-bold text-navy">This page isn&apos;t available</h1>
      <p className="mt-2 max-w-prose text-muted">
        The address may be mistyped, or this part of the admin panel isn&apos;t ready yet.
      </p>
      <Link
        href="/admin"
        className="mt-6 inline-flex min-h-11 items-center rounded-sm bg-navy px-5 font-semibold text-white hover:bg-navy-deep"
      >
        Back to the dashboard
      </Link>
    </main>
  );
}
