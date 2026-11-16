import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorHeader } from "@/components/admin/editor/EditorHeader";
import { LeaderForm } from "@/components/admin/editor/LeaderForm";
import { loadEditor, UnknownItemError } from "@/lib/admin/content-store";
import { verifySession } from "@/lib/auth/dal";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/admin/PageSkeleton";

export const metadata: Metadata = { title: "Edit director" };

export default function LeaderEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LeaderEditorPageContent params={params} />
    </Suspense>
  );
}

async function LeaderEditorPageContent({ params }: { params: Promise<{ slug: string }> }) {
  await verifySession();
  const { slug } = await params;
  const editor = await loadEditor([{ type: "leader", id: slug }]).catch((e) => {
    if (e instanceof UnknownItemError) notFound();
    throw e;
  });
  const { lastSavedAt, ...state } = editor;
  return (
    <main id="main" tabIndex={-1} className="flex flex-col gap-6 outline-none">
      <EditorHeader
        title={state.values[0].name}
        intro="This director's card on the home page and their section of the Leadership page."
        viewHref={`/leadership#${slug}`}
        lastSavedAt={lastSavedAt}
        back={{ href: "/admin/leadership", label: "All directors" }}
      />
      <LeaderForm {...state} slug={slug} />
    </main>
  );
}
