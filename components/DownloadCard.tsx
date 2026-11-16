import type { DownloadItem } from "@/lib/content/types";
import { formatBytes, formatDate } from "@/lib/format";
import { Icon } from "./Icon";

/**
 * A downloadable document: format badge, title, description, file details
 * and a premium download button. The link uses the `download` attribute so
 * the browser saves the file under a clear name.
 */
export function DownloadCard({ item }: { item: DownloadItem }) {
  const { file } = item;
  const details = [
    file.format,
    formatBytes(file.sizeBytes),
    file.pages ? `${file.pages} pages` : null,
  ].filter(Boolean);

  return (
    <div className="lift h-full rounded-lg">
      <article className="group relative flex h-full flex-col gap-5 overflow-hidden rounded-lg border border-line bg-white p-6 transition-colors duration-500 hover:border-gold sm:flex-row sm:items-center sm:p-7">
        {item.featured ? (
          <span className="absolute top-0 right-0 rounded-bl-lg bg-gold px-3 py-1 text-xs font-bold tracking-wide text-ink uppercase">
            Featured
          </span>
        ) : null}

        <div className="relative flex size-16 shrink-0 items-center justify-center rounded-lg bg-navy text-gold transition-transform duration-500 ease-premium motion-safe:group-hover:-rotate-3">
          <Icon name="file" size={30} strokeWidth={1.6} />
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-sm bg-gold px-1.5 py-0.5 text-[0.6875rem] leading-none font-extrabold text-ink uppercase">
            {file.format}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h3 className="text-xl font-bold text-navy">{item.title}</h3>
          <p className="text-[0.9375rem] text-muted">{item.description}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span>{details.join(" · ")}</span>
            <span aria-hidden="true" className="text-line">|</span>
            <span>
              Updated <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
            </span>
          </p>
        </div>

        <a
          href={file.url}
          download={file.fileName}
          className="btn-fx inline-flex min-h-12 shrink-0 items-center justify-center gap-2.5 rounded-sm bg-navy px-6 font-bold text-white [--btn-fill:var(--color-gold)] hover:text-ink focus-visible:text-ink"
        >
          <Icon name="download" size={18} strokeWidth={2.2} className="btn-fx-arrow" />
          Download
          <span className="sr-only">
            {item.title} ({details.join(", ")})
          </span>
        </a>
      </article>
    </div>
  );
}
