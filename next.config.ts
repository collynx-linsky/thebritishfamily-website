
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,

  // Allow access from another PC on the local network
  allowedDevOrigins: ["10.162.211.233"],

  // Keep draft and demo deployments out of search engines unless
  // ALLOW_SEARCH_INDEXING=true (see lib/seo.ts). Also covers images and PDFs.
  async headers() {
    if (process.env.ALLOW_SEARCH_INDEXING === "true") return [];
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },

  // Uploaded photos are stored in Vercel Blob (lib/media/storage.ts); allow
  // next/image to optimise them. Only the media folder, only over HTTPS.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com", port: "", pathname: "/media/**", search: "" }],
  },

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
