import { ThemeStudio } from "@/components/site/studio/theme-studio"
import { pageMetadata } from "@/lib/metadata"
import { PAGES } from "@/lib/og/pages"

export const metadata = pageMetadata(PAGES.themes)

export default function ThemesPage() {
  return <ThemeStudio />
}
