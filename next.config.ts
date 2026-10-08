import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Inlined so client components (studio export) see the same host as the server:
  // NEXT_PUBLIC_REGISTRY_URL, else glasscn.app on Vercel, else localhost.
  env: {
    NEXT_PUBLIC_REGISTRY_URL:
      process.env.NEXT_PUBLIC_REGISTRY_URL ?? (process.env.VERCEL ? "https://glasscn.app" : "http://localhost:3000"),
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
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
