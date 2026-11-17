import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { getLeaderList } from "@/lib/admin/queries";
import { verifySession } from "@/lib/auth/dal";
import { formatRelative } from "@/lib/format";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/admin/PageSkeleton";

export const metadata: Metadata = { title: "Leadership" };

export default function LeadershipAdminPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LeadershipAdminPageContent />
    </Suspense>
  );
}

async function LeadershipAdminPageContent() {
  await verifySession();
  const leaders = await getLeaderList();
  return (
    <main id="main" tabIndex={-1} className="flex flex-col gap-6 outline-none">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-navy sm:text-3xl">Leadership</h1>
        <p className="mt-2 max-w-2xl text-muted">Choose a director to edit their name, role, biography and email.</p>
      </header>
      <ul className="grid gap-4 md:grid-cols-2">
        {leaders.map((l) => (
          <li key={l.slug} className="min-w-0">
            <Link
              href={`/admin/leadership/${l.slug}`}
              className="group flex h-full min-w-0 items-center gap-4 rounded-lg border border-line bg-white p-5 transition-colors hover:border-navy"
            >
              <span className="relative size-16 shrink-0 overflow-hidden rounded-full bg-mist">
                <Image src={l.photo} alt="" fill sizes="64px" className="object-cover" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-lg font-bold [overflow-wrap:anywhere] text-navy">{l.name}</span>
                <span className="text-sm [overflow-wrap:anywhere] text-muted">{l.role}</span>
                <span className="text-xs text-muted">{l.lastSavedAt ? `Last saved ${formatRelative(l.lastSavedAt)}` : "Not changed yet"}</span>
              </span>
              <Icon name="arrow" size={18} className="shrink-0 text-navy group-hover:text-gold-deep" />
              <span className="sr-only">Edit</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
