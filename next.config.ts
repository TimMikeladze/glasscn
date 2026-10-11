import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

import { registryUrl as resolveRegistryUrl } from "./scripts/registry-url.mjs";

/**
 * Where install commands point — the same rule the registry build stamps (scripts/registry-url.mjs):
 * NEXT_PUBLIC_REGISTRY_URL, else glasscn.app on Vercel production, the preview's own URL on previews,
 * else localhost. In `next dev` the config loads after the server is listening, so PORT is the port
 * it actually got — commands stay right on any port (3000 taken, `-p 3011`, …).
 */
function registryUrl(phase: string) {
  return resolveRegistryUrl(process.env, { port: phase === PHASE_DEVELOPMENT_SERVER ? (process.env.PORT ?? "3000") : "3000" });
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
