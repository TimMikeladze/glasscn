/**
 * The registry's public URL for this build: NEXT_PUBLIC_REGISTRY_URL, else https://glasscn.app for
 * Vercel production, the deployment's branch (or deployment) URL for Vercel previews — so a preview's
 * items depend on the preview's items, not production's — else localhost.
 */
export function registryUrl(env = process.env, { port = "3000" } = {}) {
  if (env.NEXT_PUBLIC_REGISTRY_URL) return env.NEXT_PUBLIC_REGISTRY_URL.replace(/\/$/, "")
  if (!env.VERCEL) return `http://localhost:${port}`
  const host = env.VERCEL_ENV === "production" ? null : (env.VERCEL_BRANCH_URL ?? env.VERCEL_URL)
  return host ? `https://${host}` : "https://glasscn.app"
}
