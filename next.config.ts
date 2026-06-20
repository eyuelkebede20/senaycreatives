import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone build keeps the deploy footprint small for shared hosting.
  output: "standalone",
  // No runtime image optimization → no `sharp` native dependency to install on
  // the shared host. Fine for a logo + a handful of images served from /public.
  images: {
    unoptimized: true,
  },
  // Next fails the build on type errors by default — we keep that default.
  // Lint runs separately via `pnpm lint`.

  // Baseline security headers (defence in depth; LiteSpeed/Passenger may add more).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

export default nextConfig;
