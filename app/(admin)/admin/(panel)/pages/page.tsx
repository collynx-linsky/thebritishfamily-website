import type { Metadata } from "next";
import { EditorHeader } from "@/components/admin/editor/EditorHeader";
import { PagesForm } from "@/components/admin/editor/PagesForm";
import { getCompany } from "@/lib/content/site-content";
import { siteUrl } from "@/lib/seo";
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
  const [{ lastSavedAt, ...state }, company] = await Promise.all([loadEditor([{ type: "section", id: "pages" }]), getCompany()]);
  return (
    <main id="main" tabIndex={-1} className="flex flex-col gap-6 outline-none">
      <EditorHeader
        title="Page text and SEO"
        intro="The banner at the top of each page, and how each page appears in Google search results. Open a page below to edit it."
        viewHref="/"
        lastSavedAt={lastSavedAt}
      />
      <PagesForm {...state} siteHost={siteUrl} companyName={company.name} />
    </main>
  );
}
