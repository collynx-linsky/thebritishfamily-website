"use client";

import { useActionState } from "react";
import { signOutOtherDevices, type ActionResult } from "@/lib/admin/actions/auth";

export function SignOutOtherDevices() {
  const [result, action, pending] = useActionState<ActionResult | null>(signOutOtherDevices, null);
  return (
    <form action={action} className="flex flex-col items-start gap-3">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center rounded-sm border border-navy px-4 text-sm font-semibold text-navy hover:bg-navy hover:text-white disabled:opacity-60"
      >
        {pending ? "Signing out…" : "Sign out of other devices"}
      </button>
      {result ? (
        <p role="status" className={`text-sm ${result.ok ? "text-navy" : "text-error"}`}>
          {result.ok ? result.message : result.error}
        </p>
      ) : null}
    </form>
  );
}
