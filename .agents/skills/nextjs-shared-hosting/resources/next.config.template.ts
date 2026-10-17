import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required: produces a minimal standalone bundle in .next/standalone
  output: "standalone",

  // Recommended: disable sharp runtime requirement on shared hosts
  images: {
    unoptimized: true,
  },

  // Security headers recommended for shared hosting environments
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
