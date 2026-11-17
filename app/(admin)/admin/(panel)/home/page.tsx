import type { Metadata } from "next";
import { Suspense } from "react";
import { EditorWorkspace } from "@/components/admin/editor/EditorWorkspace";
import { HomeForm } from "@/components/admin/editor/HomeForm";
import { PageSkeleton } from "@/components/admin/PageSkeleton";
import { listVersions, loadEditor, readEntity, type EntityRef } from "@/lib/admin/content-store";
import { verifySession } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Home page" };

const REFS: EntityRef[] = [{ type: "section", id: "home" }];

export default function HomeEditorPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <HomeEditorContent />
    </Suspense>
  );
}

async function HomeEditorContent() {
  await verifySession();
  const [editor, slides, versions] = await Promise.all([
    loadEditor([{ type: "section", id: "home" }]),
    readEntity({ type: "hero_slides", id: "all" }),
    listVersions(REFS),
  ]);
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <EditorWorkspace
        form="home"
        crumbs={[{ label: "Dashboard", href: "/admin" }]}
        title="Home page"
        help="The headline, section headings, key facts and the call-to-action band. Type on the left and watch the page change on the right; nothing goes live until you save."
        viewHref="/"
        previewPath="/"
        versions={versions}
      >
        <HomeForm values={editor.values} version={editor.version} canUndo={editor.canUndo} isOriginal={editor.isOriginal} slides={slides} />
      </EditorWorkspace>
    </main>
  );
}
