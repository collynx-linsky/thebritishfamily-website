import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { getSession } from "@/lib/auth/session";
import { company } from "@/lib/site";

export const metadata: Metadata = { title: "Sign in" };

/**
 * Split sign-in: navy brand panel (what this is) beside a calm sign-in card
 * (what to do). On phones the brand panel becomes a compact band on top.
 */
export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main id="main" className="grid min-h-dvh flex-1 grid-cols-[minmax(0,1fr)] lg:grid-cols-2">
      <section
        aria-labelledby="admin-title"
        className="on-dark relative isolate flex flex-col gap-8 overflow-hidden bg-navy-deep px-6 py-8 text-white sm:px-10 sm:py-10 lg:justify-between lg:p-14 xl:p-16"
      >
        {/* Brand ring motif, as on the public site */}
        <span
          aria-hidden="true"
          className="absolute -right-40 -bottom-40 -z-10 hidden aspect-square w-[28rem] rounded-full border-[1.75rem] border-gold lg:block xl:w-[32rem]"
        />
        <div className="flex items-center gap-3">
          <Image src={company.logo.src} alt="" width={56} height={46} style={{ width: 56, height: 46 }} priority />
          <span className="font-display text-lg leading-tight font-bold">
            The British
            <br />
            Family Limited
          </span>
        </div>

        <div className="max-w-lg">
          <p className="text-xs font-bold tracking-[0.18em] text-gold uppercase">Website admin</p>
          <h1 id="admin-title" className="mt-3 font-display text-3xl leading-[1.08] font-extrabold sm:text-4xl lg:text-5xl">
            The BFL website, in your hands.
          </h1>
          <p className="mt-4 max-w-md text-base text-on-navy sm:text-lg">
            Update the words, photos and contact details on the company website. Changes go live as soon as you save, and every
            change can be undone.
          </p>
        </div>

        <p className="hidden text-sm text-on-navy/80 lg:block">
          A private area for The British Family Limited. Not you?{" "}
          <Link href="/" className="font-semibold text-gold underline-offset-4 hover:underline">
            Go to the website
          </Link>
        </p>
      </section>

      <div className="flex items-start justify-center bg-paper px-5 py-10 sm:items-center sm:px-8 lg:py-14">
        <div className="w-full max-w-[26rem] min-w-0">
          <div className="rounded-xl border border-paper-line bg-white p-6 shadow-[0_18px_48px_-24px_rgba(20,39,77,0.35)] sm:p-9">
            <h2 className="font-display text-2xl font-extrabold text-navy">Sign in</h2>
            <p className="mt-1 mb-6 text-sm text-muted">Use the administrator email address and password.</p>
            {/* Session and query string are request data, so they sit behind Suspense */}
            <Suspense fallback={<div className="h-64" aria-hidden="true" />}>
              <LoginGate searchParams={searchParams} />
            </Suspense>
          </div>
          <p className="mt-6 text-center text-sm text-muted">
            Forgotten the password? Ask your website developer to reset it.
          </p>
          <p className="mt-3 text-center text-sm lg:hidden">
            <Link href="/" className="inline-flex min-h-11 items-center font-semibold text-navy underline-offset-4 hover:underline">
              Go to the website
            </Link>
          </p>
        </div>
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
