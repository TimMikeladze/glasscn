import type { Metadata } from "next"

import { LiquidGlassShowcase } from "@/components/site/liquid-glass-showcase"

export const metadata: Metadata = {
  title: "Liquid Glass showcase",
  description: "Apple-inspired Photos, Music, Maps, Safari, Mail, Controls, Landmarks, Notes, Search and Materials examples, with native system Liquid Glass.",
}

export default function ShowcasePage() {
  return <LiquidGlassShowcase />
}
