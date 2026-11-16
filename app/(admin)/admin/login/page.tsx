import Image from "next/image";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { getSession } from "@/lib/auth/session";
import { company } from "@/lib/site";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main id="main" className="flex flex-1 items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <Image src={company.logo.src} alt="" width={60} height={50} style={{ width: 60, height: 50 }} />
          <div className="leading-tight">
            <p className="font-display text-lg font-extrabold text-navy">BFL website</p>
            <p className="text-sm text-muted">Administration</p>
          </div>
        </div>
        <div className="rounded-lg border border-line bg-white p-7 shadow-card sm:p-9">
          <h1 className="text-2xl font-bold text-navy">Sign in</h1>
          <p className="mt-1 mb-6 text-sm text-muted">Use the administrator email and password.</p>
          {/* Session and query string are request data, so they sit behind Suspense */}
          <Suspense fallback={<div className="h-64" aria-hidden="true" />}>
            <LoginGate searchParams={searchParams} />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Forgotten the password? The developer can reset it with <code className="text-navy">npm run admin:reset-password</code>.
        </p>
      </div>
    </main>
  );
}

async function LoginGate({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  if (await getSession()) redirect("/admin");
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  return <LoginForm next={next} signedOut={params.signedOut === "1"} />;
}
