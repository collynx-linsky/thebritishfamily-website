import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";
import { SignOutOtherDevices } from "@/components/admin/SignOutOtherDevices";
import { verifySession } from "@/lib/auth/dal";
import { requireDb, schema } from "@/lib/db";
import { formatRelative } from "@/lib/format";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/admin/PageSkeleton";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AccountPageContent />
    </Suspense>
  );
}

async function AccountPageContent() {
  const session = await verifySession();
  const [user] = await requireDb()
    .select({ passwordChangedAt: schema.adminUsers.passwordChangedAt })
    .from(schema.adminUsers)
    .where(eq(schema.adminUsers.id, session.userId));

  return (
    <main id="main" className="outline-none" tabIndex={-1}>
      <h1 className="font-display text-3xl font-extrabold text-navy">Account</h1>
      <p className="mt-2 text-muted">
        Signed in as <strong className="font-semibold text-ink">{session.email}</strong>.
      </p>

      <section aria-labelledby="password-title" className="mt-8 rounded-lg border border-line bg-white p-6">
        <h2 id="password-title" className="text-xl font-bold text-navy">
          Change password
        </h2>
        <p className="mt-1 mb-5 text-sm text-muted">
          {user ? <>Password last changed {formatRelative(user.passwordChangedAt)}. </> : null}
          After changing it, any other device where you are signed in will be signed out.
        </p>
        <ChangePasswordForm />
      </section>

      <section aria-labelledby="devices-title" className="mt-6 rounded-lg border border-line bg-white p-6">
        <h2 id="devices-title" className="text-xl font-bold text-navy">
          Other devices
        </h2>
        <p className="mt-1 mb-4 text-sm text-muted">
          If you signed in on a shared or lost device, sign out everywhere except here.
        </p>
        <SignOutOtherDevices />
      </section>
    </main>
  );
}
