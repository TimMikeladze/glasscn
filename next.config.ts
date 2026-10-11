import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

/**
 * Where install commands point: NEXT_PUBLIC_REGISTRY_URL, else glasscn.app on Vercel, else localhost.
 * In `next dev` the config loads after the server is listening, so PORT is the port it actually got —
 * commands stay right on any port (3000 taken, `-p 3011`, …).
 */
function registryUrl(phase: string) {
  if (process.env.NEXT_PUBLIC_REGISTRY_URL) return process.env.NEXT_PUBLIC_REGISTRY_URL;
  if (process.env.VERCEL) return "https://glasscn.app";
  const port = phase === PHASE_DEVELOPMENT_SERVER ? (process.env.PORT ?? "3000") : "3000";
  return `http://localhost:${port}`;
}

export default function config(phase: string): NextConfig {
  return {
    // Inlined so client components (studio export) see the same host as the server.
    env: { NEXT_PUBLIC_REGISTRY_URL: registryUrl(phase) },
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
}
