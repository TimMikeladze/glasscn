import { PAGES } from "@/lib/og/pages"
import { ogContentType, ogSize, renderOg } from "@/lib/og/render"

export const alt = `${PAGES.home.title} — glasscn`
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return renderOg(PAGES.home)
}
