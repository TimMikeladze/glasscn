// Next hashes only this file into the image URL (?hash), so X keeps a stale card when render.tsx or pages.ts change. Bump on visual changes: og-v2
import { PAGES } from "@/lib/og/pages"
import { ogContentType, ogSize, renderOg } from "@/lib/og/render"

export const alt = `${PAGES.installation.title} — glasscn`
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return renderOg(PAGES.installation)
}
