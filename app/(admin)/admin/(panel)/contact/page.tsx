import type { Metadata } from "next";
import { CompanyDetailsForm } from "@/components/admin/editor/CompanyDetailsForm";
import { EditorHeader } from "@/components/admin/editor/EditorHeader";
import { loadEditor } from "@/lib/admin/content-store";
import { verifySession } from "@/lib/auth/dal";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/admin/PageSkeleton";

export const metadata: Metadata = { title: "Contact details" };

export default function ContactEditorPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ContactEditorPageContent />
    </Suspense>
  );
}

async function ContactEditorPageContent() {
  await verifySession();
  const { lastSavedAt, ...state } = await loadEditor([{ type: "section", id: "company" }]);
  return (
    <main id="main" tabIndex={-1} className="flex flex-col gap-6 outline-none">
      <EditorHeader
        title="Contact details"
        intro="The company's name, address, phone numbers, email and WhatsApp number. These appear on every page of the website."
        viewHref="/contact"
        lastSavedAt={lastSavedAt}
      />
      <CompanyDetailsForm {...state} />
    </main>
  );
}
