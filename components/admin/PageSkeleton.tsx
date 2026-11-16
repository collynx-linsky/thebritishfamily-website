/**
 * Shown instantly while an admin page loads its data. Admin pages read the
 * session and the database on every request; each page wraps that part in
 * <Suspense> with this fallback, so a click in the admin navigation changes
 * the screen at once instead of waiting for the data.
 */
export function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="flex animate-pulse flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="h-8 w-56 max-w-full rounded-sm bg-line" />
        <div className="h-4 w-96 max-w-full rounded-sm bg-line/70" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-40 rounded-lg border border-line bg-white" />
      ))}
    </div>
  );
}
