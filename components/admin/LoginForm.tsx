"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/lib/admin/actions/auth";

export function LoginForm({ next, signedOut }: { next?: string; signedOut?: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {signedOut && !state.error ? (
        <p role="status" className="rounded-md bg-mist px-4 py-3 text-sm text-navy">
          You have been signed out.
        </p>
      ) : null}
      {state.error ? (
        <p role="alert" className="rounded-md border border-error/30 bg-error/5 px-4 py-3 text-sm font-medium text-error">
          {state.error}
        </p>
      ) : null}

      {next ? <input type="hidden" name="next" value={next} /> : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-semibold text-navy">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          defaultValue={state.email}
          aria-invalid={state.error ? true : undefined}
          className="min-h-12 rounded-sm border border-line bg-white px-4 text-base text-ink focus:border-navy focus:outline-none focus-visible:outline-3 focus-visible:outline-offset-0 focus-visible:outline-navy/25"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-semibold text-navy">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={state.error ? true : undefined}
          className="min-h-12 rounded-sm border border-line bg-white px-4 text-base text-ink focus:border-navy focus:outline-none focus-visible:outline-3 focus-visible:outline-offset-0 focus-visible:outline-navy/25"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex min-h-12 items-center justify-center rounded-sm bg-navy px-6 font-bold text-white transition-colors hover:bg-navy-deep disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
