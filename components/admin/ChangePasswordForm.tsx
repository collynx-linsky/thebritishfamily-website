"use client";

import { useActionState, useEffect, useRef } from "react";
import { useHydrated } from "./useHydrated";
import { changePassword, type PasswordState } from "@/lib/admin/actions/account";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password-rules";

const inputClass =
  "min-h-12 w-full rounded-sm border bg-white px-4 text-base text-ink focus:border-navy focus:outline-none focus-visible:outline-3 focus-visible:outline-offset-0 focus-visible:outline-navy/25";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(changePassword, { status: "idle" });
  const hydrated = useHydrated();
  const formRef = useRef<HTMLFormElement>(null);
  const fields = state.status === "error" ? (state.fields ?? {}) : {};

  // Clear the fields after a successful change
  useEffect(() => {
    if (state.status === "saved") formRef.current?.reset();
  }, [state]);

  const field = (name: "current" | "next" | "confirm", label: string, autoComplete: string, hint?: string) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`pw-${name}`} className="text-sm font-semibold text-navy">
        {label}
      </label>
      <input
        id={`pw-${name}`}
        name={name}
        type="password"
        autoComplete={autoComplete}
        required
        aria-invalid={fields[name] ? true : undefined}
        aria-describedby={[hint ? `pw-${name}-hint` : null, fields[name] ? `pw-${name}-error` : null].filter(Boolean).join(" ") || undefined}
        className={`${inputClass} ${fields[name] ? "border-error" : "border-line"}`}
      />
      {hint ? (
        <p id={`pw-${name}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {fields[name] ? (
        <p id={`pw-${name}-error`} className="text-sm font-medium text-error">
          {fields[name]}
        </p>
      ) : null}
    </div>
  );

  return (
    <form ref={formRef} action={action} className="flex max-w-md flex-col gap-4" noValidate>
      {state.status === "saved" ? (
        <p role="status" className="rounded-md border border-navy/15 bg-mist px-4 py-3 text-sm font-medium text-navy">
          {state.message}
        </p>
      ) : null}
      {state.status === "error" ? (
        <p role="alert" className="rounded-md border border-error/30 bg-error/5 px-4 py-3 text-sm font-medium text-error">
          {state.message}
        </p>
      ) : null}
      {/* Hidden username field so password managers know which account this is */}
      <input type="text" name="username" autoComplete="username" hidden readOnly />
      {field("current", "Current password", "current-password")}
      {field("next", "New password", "new-password", `At least ${MIN_PASSWORD_LENGTH} characters. A short sentence is easy to remember and hard to guess.`)}
      {field("confirm", "Repeat the new password", "new-password")}
      <button
        type="submit"
        disabled={pending || !hydrated}
        className="inline-flex min-h-12 w-fit items-center rounded-sm bg-navy px-6 font-bold text-white hover:bg-navy-deep disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Changing password…" : "Change password"}
      </button>
    </form>
  );
}
