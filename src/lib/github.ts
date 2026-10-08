/**
 * The repository's star count, for the header.
 *
 * Unauthenticated and cached for hours: the number is decoration, and a rate
 * limit or an outage must never be able to fail a page render. A failed fetch
 * returns null and the header draws the icon on its own, rather than claiming
 * the project has zero stars.
 */
import { cacheLife } from "next/cache"

import { site } from "@/lib/site"

const REPO = site.repository.replace("https://github.com/", "")

export async function repoStars(): Promise<number | null> {
  "use cache"
  cacheLife("hours")
  try {
    // No identifying headers: a build-time request from whatever machine renders.
    const response = await fetch(`https://api.github.com/repos/${REPO}`, {
      headers: { accept: "application/vnd.github+json" },
    })
    if (!response.ok) return null
    const data = (await response.json()) as { stargazers_count?: number }
    return typeof data.stargazers_count === "number" ? data.stargazers_count : null
  } catch {
    // Offline dev, a rate limit, a DNS hiccup: the header does without.
    return null
  }
}
