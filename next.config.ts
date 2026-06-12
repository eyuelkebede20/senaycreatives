import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone build keeps the deploy footprint small for shared hosting.
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Next fails the build on type errors by default — we keep that default.
  // Lint runs separately via `pnpm lint`.
};

export default nextConfig;
