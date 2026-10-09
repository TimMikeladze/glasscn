/** The production domain. */
export const siteUrl = "https://glasscn.app"

/**
 * Where the registry is served. Install commands on the site use it.
 * `next.config.ts` resolves it: NEXT_PUBLIC_REGISTRY_URL, else glasscn.app on Vercel, else localhost.
 */
export const registryUrl = (process.env.NEXT_PUBLIC_REGISTRY_URL ?? "http://localhost:3000").replace(/\/$/, "")

export const site = {
  name: "glasscn",
  url: siteUrl,
  repository: "https://github.com/TimMikeladze/glasscn",
  discord: "https://discord.gg/linesofcode",
  author: {
    name: "Tim Mikeladze",
    twitter: "https://twitter.com/linesofcode",
    linkedin: "https://www.linkedin.com/in/tim-mikeladze",
    portfolio: "https://linesofcode.dev",
  },
  tagline: "Glass components for shadcn.",
  description:
    "A shadcn registry of glassmorphic components — frosted surfaces over a living aurora, iOS-grade controls and data pieces — installed as source and themed with CSS variables.",
}

export const itemUrl = (name: string) => `${registryUrl}/r/${name}.json`
