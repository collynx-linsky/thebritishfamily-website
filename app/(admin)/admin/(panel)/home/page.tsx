import type { Metadata } from "next";
import { EditorHeader } from "@/components/admin/editor/EditorHeader";
import { HomeForm } from "@/components/admin/editor/HomeForm";
import { loadEditor } from "@/lib/admin/content-store";
import { verifySession } from "@/lib/auth/dal";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/admin/PageSkeleton";

export const metadata: Metadata = { title: "Home page" };

export default function HomeEditorPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <HomeEditorPageContent />
    </Suspense>
  );
}

async function HomeEditorPageContent() {
  await verifySession();
  const { lastSavedAt, ...state } = await loadEditor([
    { type: "section", id: "home" },
    { type: "hero_slides", id: "all" },
  ]);
  return (
    <main id="main" tabIndex={-1} className="flex flex-col gap-6 outline-none">
      <EditorHeader
        title="Home page"
        intro="The headline, slideshow, section headings, key facts and the call-to-action band."
        viewHref="/"
        lastSavedAt={lastSavedAt}
      />
      <HomeForm {...state} />
    </main>
  );
}
