/**
 * Enquiry submission, kept separate from the form UI.
 *
 * Today there is no backend, so `mailtoTransport` opens the visitor's
 * email app with the enquiry pre-filled. To connect a real backend later,
 * write another transport (see `exampleApiTransport` below) and assign it
 * to `activeTransport`. The form component does not need to change.
 */

import { company } from "./site";

export type Enquiry = {
  name: string;
  email: string;
  phone: string;
  /** Sector slug, or "general" */
  sector: string;
  /** Human-readable sector name, for the message itself */
  sectorLabel: string;
  message: string;
};

export type EnquiryField = "name" | "email" | "phone" | "sector" | "message";

export type EnquiryErrors = Partial<Record<EnquiryField, string>>;

export type EnquiryResult =
  /** Handed to another app (email); the visitor still has to press send */
  | { status: "handoff" }
  /** Delivered by a backend */
  | { status: "sent" }
  | { status: "error"; message: string };

export type EnquiryTransport = (enquiry: Enquiry) => Promise<EnquiryResult>;

/* ------------------------------------------------------------------
   Validation (shared by the form today and a backend tomorrow)
   ------------------------------------------------------------------ */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+\d][\d\s()-]{6,}$/;

export function validateEnquiry(enquiry: Enquiry): EnquiryErrors {
  const errors: EnquiryErrors = {};
  if (enquiry.name.trim().length < 2) errors.name = "Please enter your name.";
  if (!enquiry.email.trim()) errors.email = "Please enter your email address.";
  else if (!EMAIL_PATTERN.test(enquiry.email.trim()))
    errors.email = "Please enter a valid email address, for example name@example.com.";
  if (enquiry.phone.trim() && !PHONE_PATTERN.test(enquiry.phone.trim()))
    errors.phone = "Please enter a valid phone number, or leave this field empty.";
  if (!enquiry.sector) errors.sector = "Please choose what your enquiry is about.";
  if (enquiry.message.trim().length < 10)
    errors.message = "Please tell us a little more about what you need (at least 10 characters).";
  return errors;
}

/* ------------------------------------------------------------------
   Transports
   ------------------------------------------------------------------ */

export function buildMailtoUrl(enquiry: Enquiry, to: string = company.email) {
  const subject = `Website enquiry: ${enquiry.sectorLabel} (${enquiry.name.trim()})`;
  const body = [
    `Name: ${enquiry.name.trim()}`,
    `Email: ${enquiry.email.trim()}`,
    `Phone: ${enquiry.phone.trim() || "Not provided"}`,
    `Enquiry about: ${enquiry.sectorLabel}`,
    "",
    enquiry.message.trim(),
    "",
    "Sent from the website enquiry form",
  ].join("\r\n");
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Opens the visitor's email app with the enquiry ready to send. */
export const mailtoTransport: EnquiryTransport = async (enquiry) => {
  try {
    window.location.href = buildMailtoUrl(enquiry);
    return { status: "handoff" };
  } catch {
    return { status: "error", message: "We could not open your email app." };
  }
};

/**
 * Example for later: post to a route handler (app/api/enquiry/route.ts)
 * or a form service. Not used yet.
 */
export const exampleApiTransport: EnquiryTransport = async (enquiry) => {
  const response = await fetch("/api/enquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(enquiry),
  });
  return response.ok
    ? { status: "sent" }
    : { status: "error", message: "Your enquiry could not be sent. Please try again." };
};

/** Swap this to change how enquiries are delivered. */
const activeTransport: EnquiryTransport = mailtoTransport;

export function submitEnquiry(enquiry: Enquiry): Promise<EnquiryResult> {
  return activeTransport(enquiry);
}
