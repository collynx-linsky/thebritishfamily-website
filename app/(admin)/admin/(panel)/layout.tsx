import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { logout } from "@/lib/admin/actions/auth";
import { verifySession } from "@/lib/auth/dal";
import { company } from "@/lib/site";

/**
 * Shell for every signed-in admin page. The session check reads a cookie, so
 * it sits behind Suspense; pages repeat the check themselves because layouts
 * do not re-run on client-side navigation.
 */
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </Suspense>
  );
}

async function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const session = await verifySession();
  return (
    <>
      <a
        href="#main"
        className="fixed top-3 left-3 z-100 -translate-y-24 rounded-sm bg-gold px-5 py-3 font-bold text-ink transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <header className="on-dark bg-navy text-white">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-5">
          <Link href="/admin" className="flex min-h-11 items-center gap-3 rounded-sm">
            <Image src={company.logo.src} alt="" width={40} height={33} style={{ width: 40, height: 33 }} />
            <span className="font-display font-bold">BFL Admin</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener"
              className="hidden min-h-11 items-center rounded-sm px-2 text-sm text-on-navy hover:text-gold sm:inline-flex"
            >
              View website
            </a>
            <span className="hidden max-w-48 truncate text-sm text-on-navy md:inline">{session.email}</span>
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-sm border border-white/30 px-4 text-sm font-semibold hover:border-gold hover:text-gold"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </>
  );
}

function PanelSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="h-16 bg-navy" />
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="h-8 w-56 rounded-sm bg-line" />
      </div>
    </div>
  );
}
