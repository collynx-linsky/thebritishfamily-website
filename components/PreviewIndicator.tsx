import { cacheLife } from "next/cache";
import { draftMode } from "next/headers";
import { exitPreview } from "@/lib/actions/exit-preview";

/**
 * Shown only in Draft Mode (an admin previewing unsaved changes). Read inside
 * a cached component, as the Next.js docs describe for Cache Components: it
 * renders nothing at build time, so public pages stay static, and re-runs
 * per request only for an admin in Draft Mode. The editor's preview frame
 * hides it (data-preview-indicator).
 */
export async function PreviewIndicator() {
  "use cache";
  // Without its own lifetime this would get the default 15-minute profile and
  // shorten every public page's cache to match. Its output only changes in
  // Draft Mode, which bypasses the cache anyway.
  cacheLife("max");
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;
  return (
    <aside
      data-preview-indicator
      role="status"
      className="fixed inset-x-3 bottom-3 z-90 mx-auto flex max-w-xl flex-wrap items-center justify-between gap-3 rounded-lg bg-ink px-4 py-3 text-sm text-white shadow-lift sm:inset-x-auto sm:right-4 sm:left-auto"
    >
      <span>
        <strong className="text-gold">Preview.</strong> You are seeing unsaved changes from the admin.
      </span>
      <form action={exitPreview}>
        <button type="submit" className="inline-flex min-h-11 items-center rounded-md bg-white/10 px-4 font-semibold hover:bg-white/20">
          Exit preview
        </button>
      </form>
    </aside>
  );
}
