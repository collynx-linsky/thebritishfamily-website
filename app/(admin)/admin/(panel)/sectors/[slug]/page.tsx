import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorHeader } from "@/components/admin/editor/EditorHeader";
import { SectorForm } from "@/components/admin/editor/SectorForm";
import { loadEditor, UnknownItemError } from "@/lib/admin/content-store";
import { verifySession } from "@/lib/auth/dal";
import { sectorSamples, samples } from "@/lib/samples";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/admin/PageSkeleton";

export const metadata: Metadata = { title: "Edit sector" };

export default function SectorEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SectorEditorPageContent params={params} />
    </Suspense>
  );
}

async function SectorEditorPageContent({ params }: { params: Promise<{ slug: string }> }) {
  await verifySession();
  const { slug } = await params;
  const editor = await loadEditor([{ type: "sector", id: slug }]).catch((e) => {
    if (e instanceof UnknownItemError) notFound();
    throw e;
  });
  const { lastSavedAt, ...state } = editor;
  const sample = sectorSamples[slug]?.[0] ?? samples.teamMeeting;
  return (
    <main id="main" tabIndex={-1} className="flex flex-col gap-6 outline-none">
      <EditorHeader
        title={state.values[0].name}
        intro="This sector's card on the home and Sectors pages, and its own page."
        viewHref={`/sectors/${slug}`}
        lastSavedAt={lastSavedAt}
        back={{ href: "/admin/sectors", label: "All sectors" }}
      />
      <SectorForm {...state} slug={slug} sample={{ src: sample.src, alt: sample.alt }} />
    </main>
  );
}
