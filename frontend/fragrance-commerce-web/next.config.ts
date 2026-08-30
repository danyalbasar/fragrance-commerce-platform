import type { NextConfig } from "next";

const connectSources = [
  "'self'",
  "https://fragrance-api-654j.onrender.com",
  "https://api.razorpay.com",
  "https://lumberjack.razorpay.com",
  ...(process.env.NODE_ENV === "development"
    ? ["http://localhost:5203"]
    : []),
].join(" ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://res.cloudinary.com https://*.razorpay.com; font-src 'self' data:; connect-src ${connectSources}; frame-src 'self' https://*.razorpay.com; frame-ancestors 'none'; base-uri 'self'`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
