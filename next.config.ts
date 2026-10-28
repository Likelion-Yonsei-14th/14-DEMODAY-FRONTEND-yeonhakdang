import type { NextConfig } from "next";

/**
 * The 연학당 backend (Spring). Its paths are proxied so the browser only ever
 * talks to this origin: the session cookie stays first-party and needs no CORS.
 * Server-only — never a NEXT_PUBLIC_ value. Unset, nothing is proxied.
 */
const backend = process.env.BACKEND_ORIGIN?.trim().replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!backend) return [];
    return [
      { source: "/api/:path*", destination: `${backend}/api/:path*` },
      // 카카오 login: the start, and the callback 카카오 redirects back to.
      { source: "/oauth2/:path*", destination: `${backend}/oauth2/:path*` },
      { source: "/login/oauth2/:path*", destination: `${backend}/login/oauth2/:path*` },
    ];
  },
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
