import { draftMode } from "next/headers";
import { clearPreviewDrafts } from "@/lib/admin/content-store";
import { refsFor } from "@/lib/admin/editor-forms";
import { getSession } from "@/lib/auth/session";

/**
 * Ends the live preview when the admin leaves an editor or closes the tab.
 * Called with a keepalive request (it must complete while the page goes
 * away, which a server action started during navigation does not
 * guarantee). Same-site only: the session cookie is SameSite=Strict, and
 * the Origin is checked as well.
 */
export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return new Response(null, { status: 403 });
  const session = await getSession();
  if (!session) return new Response(null, { status: 401 });
  try {
    const { form, slug } = (await request.json()) as { form?: string; slug?: string };
    await clearPreviewDrafts(refsFor(String(form ?? ""), String(slug ?? "")));
  } catch {
    // Unknown editor or bad body: still leave Draft Mode below
  }
  (await draftMode()).disable();
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
