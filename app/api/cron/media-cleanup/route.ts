import { requireDb } from "@/lib/db";
import { cleanUpAbandonedUploads } from "@/lib/media/cleanup";

/**
 * Daily clean-up of abandoned uploads (see vercel.json). Vercel Cron sends
 * "Authorization: Bearer <CRON_SECRET>"; anything else is refused.
 */
export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Not allowed." }, { status: 401 });
  }
  const result = await cleanUpAbandonedUploads(requireDb());
  return Response.json(result, { headers: { "Cache-Control": "no-store" } });
}
