import { cookies } from "next/headers";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/shell/AdminShell";
import { buildNavigation, SIDEBAR_COOKIE } from "@/lib/admin/navigation";
import { getLeaderList, getSectorList } from "@/lib/admin/queries";
import { verifySession } from "@/lib/auth/dal";
import { company } from "@/lib/site";

/**
 * Frame of every signed-in admin page. The session check reads a cookie, so
 * it sits behind Suspense; pages repeat the check themselves because layouts
 * do not re-run on client-side navigation.
 */
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </Suspense>
  );
}

async function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const session = await verifySession();
  const [sectors, leaders, cookieStore] = await Promise.all([getSectorList(), getLeaderList(), cookies()]);
  return (
    <AdminShell
      sections={buildNavigation({ sectors, leaders })}
      logo={{ src: company.logo.src }}
      user={{ displayName: session.displayName, email: session.email }}
      initiallyCollapsed={cookieStore.get(SIDEBAR_COOKIE)?.value === "collapsed"}
    >
      {children}
    </AdminShell>
  );
}

/** Same proportions as the shell, so nothing jumps when it arrives */
function ShellSkeleton() {
  return (
    <div aria-hidden="true" className="grid min-h-dvh lg:grid-cols-[16.5rem_1fr]">
      <div className="hidden bg-navy-deep lg:block" />
      <div className="bg-paper">
        <div className="h-16 border-b border-paper-line" />
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-8 w-56 rounded-sm bg-paper-line" />
        </div>
      </div>
    </div>
  );
}
