import { LiquidGlassShowcase } from "@/components/site/liquid-glass-showcase"
import { pageMetadata } from "@/lib/metadata"
import { PAGES } from "@/lib/og/pages"

export const metadata = pageMetadata(PAGES.showcase)

export default function ShowcasePage() {
  return <LiquidGlassShowcase />
}
