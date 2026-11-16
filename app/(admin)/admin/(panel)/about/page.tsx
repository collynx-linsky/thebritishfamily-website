import type { Metadata } from "next";
import { AboutForm } from "@/components/admin/editor/AboutForm";
import { EditorHeader } from "@/components/admin/editor/EditorHeader";
import { loadEditor } from "@/lib/admin/content-store";
import { verifySession } from "@/lib/auth/dal";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/admin/PageSkeleton";

export const metadata: Metadata = { title: "About" };

export default function AboutEditorPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AboutEditorPageContent />
    </Suspense>
  );
}

async function AboutEditorPageContent() {
  await verifySession();
  const { lastSavedAt, ...state } = await loadEditor([{ type: "section", id: "about" }]);
  return (
    <main id="main" tabIndex={-1} className="flex flex-col gap-6 outline-none">
      <EditorHeader
        title="About"
        intro="The About page text: introduction, mission, vision, philosophy, values and how the company works. Some of it also appears on the home page."
        viewHref="/about"
        lastSavedAt={lastSavedAt}
      />
      <AboutForm {...state} />
    </main>
  );
}
