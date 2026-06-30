import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel Cron Jobs integration
  // Configure scheduled triggers in vercel.json instead
  experimental: {},

  // Ensure the Stripe webhook route receives the raw body.
  // Next.js App Router already streams the body, so no special config
  // is needed — the route handler reads it manually.

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
