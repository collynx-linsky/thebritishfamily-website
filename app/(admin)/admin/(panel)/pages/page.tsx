import type { Metadata } from "next";
import { EditorHeader } from "@/components/admin/editor/EditorHeader";
import { PagesForm } from "@/components/admin/editor/PagesForm";
import { loadEditor } from "@/lib/admin/content-store";
import { verifySession } from "@/lib/auth/dal";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/admin/PageSkeleton";

export const metadata: Metadata = { title: "Page text and SEO" };

export default function PagesEditorPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PagesEditorPageContent />
    </Suspense>
  );
}

async function PagesEditorPageContent() {
  await verifySession();
  const { lastSavedAt, ...state } = await loadEditor([{ type: "section", id: "pages" }]);
  return (
    <main id="main" tabIndex={-1} className="flex flex-col gap-6 outline-none">
      <EditorHeader
        title="Page text and SEO"
        intro="The banner at the top of each page, and how each page appears in Google search results. Open a page below to edit it."
        viewHref="/"
        lastSavedAt={lastSavedAt}
      />
      <PagesForm {...state} />
    </main>
  );
}
