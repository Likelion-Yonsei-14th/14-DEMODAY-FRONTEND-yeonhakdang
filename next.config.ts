import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Keeps the dev overlay out of screenshot comparisons against Figma.
  devIndicators: false,
  partialPrefetching: true,
  experimental: {
    agentUpgrade: "security",
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
