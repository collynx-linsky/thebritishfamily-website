"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  submitEnquiry,
  validateEnquiry,
  type Enquiry,
  type EnquiryErrors,
  type EnquiryField,
} from "@/lib/enquiry";
import { Icon } from "./Icon";

type SectorOption = { value: string; label: string };

type ContactFormProps = {
  sectorOptions: SectorOption[];
  inboxEmail: string;
  whatsappHref: string;
};

type Status = "idle" | "submitting" | "handoff" | "sent" | "error";

const fieldBase =
  "block w-full rounded-sm border bg-white px-4 py-3 text-base text-ink transition-colors placeholder:text-muted/70 hover:border-navy/40 focus:border-navy focus:outline-none focus-visible:outline-3 focus-visible:outline-offset-0 focus-visible:outline-navy/25";

export function ContactForm({ sectorOptions, inboxEmail, whatsappHref }: ContactFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [errorMessage, setErrorMessage] = useState("");
  const sectorRef = useRef<HTMLSelectElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<Status>("idle");

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Preselect the sector from ?sector=... (links on sector pages). Read in the
  // browser so the page itself stays fully static. Runs again whenever the
  // page becomes visible after a client-side navigation.
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("sector");
    if (slug && sectorRef.current && sectorOptions.some((o) => o.value === slug)) {
      sectorRef.current.value = slug;
    }
  }, [sectorOptions]);

  // The page is kept alive (hidden) after navigating away; clear a finished
  // enquiry so returning visitors see a fresh form, not a stale confirmation.
  // (The form is unmounted while the confirmation shows, so it remounts empty.)
  useLayoutEffect(() => {
    return () => {
      if (statusRef.current === "handoff" || statusRef.current === "sent") setStatus("idle");
    };
  }, []);

  useEffect(() => {
    if (status === "handoff" || status === "sent") confirmationRef.current?.focus();
  }, [status]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const sector = String(data.get("sector") ?? "");
    const enquiry: Enquiry = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      sector,
      sectorLabel: sectorOptions.find((o) => o.value === sector)?.label ?? "General enquiry",
      message: String(data.get("message") ?? ""),
    };

    const found = validateEnquiry(enquiry);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0] as EnquiryField | undefined;
    if (firstInvalid) {
      form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setStatus("submitting");
    const result = await submitEnquiry(enquiry);
    if (result.status === "error") {
      setErrorMessage(result.message);
      setStatus("error");
    } else {
      setStatus(result.status);
    }
  }

  function startOver() {
    setErrors({});
    setStatus("idle");
  }

  if (status === "handoff" || status === "sent") {
    return (
      <div
        ref={confirmationRef}
        tabIndex={-1}
        role="status"
        className="flex flex-col items-start gap-4 rounded-lg bg-mist p-7 focus:outline-none md:p-9"
      >
        <span className="inline-flex size-14 items-center justify-center rounded-full bg-gold text-ink">
          <Icon name="check" size={28} strokeWidth={2.6} />
        </span>
        {status === "handoff" ? (
          <>
            <h3 className="text-2xl font-bold text-navy">Your email is ready to send</h3>
            <p className="text-muted">
              We have opened your email app with your enquiry filled in, addressed to{" "}
              <strong className="font-semibold text-navy">{inboxEmail}</strong>.{" "}
              <strong className="font-semibold text-ink">
                Please press send in your email app
              </strong>{" "}
              so that it reaches us.
            </p>
            <p className="text-muted">
              If your email app did not open, you can email us directly or message us on WhatsApp.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-navy">Thank you, your enquiry has been sent</h3>
            <p className="text-muted">Our team will get back to you as soon as possible.</p>
          </>
        )}
        <div className="mt-2 flex flex-wrap gap-3">
          <a
            href={`mailto:${inboxEmail}`}
            className="inline-flex min-h-12 items-center gap-2 rounded-sm bg-navy px-6 font-bold text-white transition-colors hover:bg-navy-deep"
          >
            <Icon name="mail" size={18} strokeWidth={2} />
            Email us directly
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center gap-2 rounded-sm border-2 border-navy px-6 font-bold text-navy transition-colors hover:bg-navy hover:text-white"
          >
            <Icon name="whatsapp" size={18} strokeWidth={2} />
            WhatsApp
          </a>
        </div>
        <button
          type="button"
          onClick={startOver}
          className="mt-1 inline-flex min-h-11 items-center font-semibold text-navy underline decoration-line decoration-2 underline-offset-4 hover:decoration-gold"
        >
          Start a new enquiry
        </button>
      </div>
    );
  }

  const describedBy = (field: EnquiryField, hint?: string) =>
    [hint, errors[field] ? `${field}-error` : null].filter(Boolean).join(" ") || undefined;

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      <Field label="Full name" name="name" error={errors.name} required>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={describedBy("name")}
          className={`${fieldBase} ${errors.name ? "border-error" : "border-line"}`}
        />
      </Field>

      <Field label="Email address" name="email" error={errors.email} required>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={describedBy("email")}
          className={`${fieldBase} ${errors.email ? "border-error" : "border-line"}`}
        />
      </Field>

      <Field label="Phone number" name="phone" error={errors.phone} hint="Optional">
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={describedBy("phone", "phone-hint")}
          className={`${fieldBase} ${errors.phone ? "border-error" : "border-line"}`}
        />
      </Field>

      <Field label="Sector of interest" name="sector" error={errors.sector} required>
        <div className="relative">
          <select
            ref={sectorRef}
            id="sector"
            name="sector"
            required
            defaultValue=""
            aria-invalid={errors.sector ? true : undefined}
            aria-describedby={describedBy("sector")}
            className={`${fieldBase} appearance-none pr-11 ${errors.sector ? "border-error" : "border-line"}`}
          >
            <option value="" disabled>
              Choose a sector
            </option>
            {sectorOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Icon
            name="arrow"
            size={16}
            strokeWidth={2.4}
            className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 rotate-90 text-navy"
          />
        </div>
      </Field>

      <Field label="Message" name="message" error={errors.message} required className="sm:col-span-2">
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describedBy("message")}
          className={`${fieldBase} resize-y ${errors.message ? "border-error" : "border-line"}`}
        />
      </Field>

      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-sm text-muted">
          Fields marked <span className="text-amber-ink">*</span> are required. Sending opens your
          email app with your enquiry filled in, ready for you to send to our team.
        </p>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn-fx inline-flex min-h-12 shrink-0 items-center justify-center gap-2.5 rounded-sm bg-gold px-8 font-bold text-ink [--btn-fill:var(--color-gold-bright)] disabled:cursor-wait disabled:opacity-70"
        >
          <Icon name="mail" size={18} strokeWidth={2.2} />
          {status === "submitting" ? "Opening email…" : "Send enquiry"}
          <Icon name="arrow" size={18} strokeWidth={2.4} className="btn-fx-arrow" />
        </button>
      </div>

      {status === "error" ? (
        <p role="alert" className="text-sm font-semibold text-error sm:col-span-2">
          {errorMessage} Please email us at {inboxEmail} or use WhatsApp.
        </p>
      ) : null}
    </form>
  );
}

function Field({
  label,
  name,
  error,
  hint,
  required = false,
  className = "",
  children,
}: {
  label: string;
  name: EnquiryField;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={name} className="flex items-baseline justify-between gap-3 text-sm font-semibold text-navy">
        <span>
          {label}
          {required ? (
            <span aria-hidden="true" className="ml-0.5 text-amber-ink">
              *
            </span>
          ) : null}
        </span>
        {hint ? (
          <span id={`${name}-hint`} className="text-xs font-normal text-muted">
            {hint}
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={`${name}-error`} className="flex items-start gap-1.5 text-sm font-medium text-error">
          <Icon name="close" size={16} strokeWidth={2.4} className="mt-0.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
