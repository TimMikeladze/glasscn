/** Where the registry is served. Install commands on the site use it. */
export const registryUrl = (
  process.env.NEXT_PUBLIC_REGISTRY_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "")

export const site = {
  name: "glasscn",
  tagline: "Glass components for shadcn.",
  description:
    "A shadcn registry of glassmorphic components — frosted surfaces over a living aurora, iOS-grade controls and data pieces — installed as source and themed with CSS variables.",
}

export const itemUrl = (name: string) => `${registryUrl}/r/${name}.json`
