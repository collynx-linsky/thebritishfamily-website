const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * "16 November 2026" from "2026-11-16". Parsed by hand (not new Date()) so
 * output never depends on the server's time zone and prerendering stays
 * deterministic.
 */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

/**
 * "just now", "12 minutes ago", "yesterday", "3 days ago", or a date for
 * anything older than a month. Request-time use only (admin pages).
 */
export function formatRelative(date: Date, now: Date = new Date()): string {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 45) return "just now";
  const rtf = new Intl.RelativeTimeFormat("en-GB", { numeric: "auto" });
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), "minute");
  if (abs < 86_400) return rtf.format(Math.round(seconds / 3600), "hour");
  if (abs < 30 * 86_400) return rtf.format(Math.round(seconds / 86_400), "day");
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

/** "1.3 MB", "640 KB", "312 bytes" */
export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} bytes`;
}

/** The company's time zone (East Africa Time, UTC+3, no daylight saving). Servers run on UTC. */
export const SITE_TIME_ZONE = "Africa/Dar_es_Salaam";

/** Start of the current month in the company's time zone, as a Date */
export function startOfMonthInSiteZone(now: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: SITE_TIME_ZONE, year: "numeric", month: "numeric" }).formatToParts(now);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  return new Date(Date.UTC(year, month - 1, 1, -3)); // midnight EAT = 21:00 UTC the day before
}
