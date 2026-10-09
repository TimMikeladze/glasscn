import { describe, expect, it } from "vitest"

import { GROUPS } from "@/lib/docs"
import { PALETTES } from "@/lib/glass-theme"
import { pageMetadata, rootMetadata } from "@/lib/metadata"
import { GROUP_PALETTE, ogColors, oklchToHex } from "@/lib/og/colors"
import { PAGES } from "@/lib/og/pages"

const HEX = /^#[0-9a-f]{6}$/

describe("share cards", () => {
  it("converts OKLCH to sRGB hex", () => {
    expect(oklchToHex("oklch(1 0 0)")).toBe("#ffffff")
    expect(oklchToHex("oklch(0 0 0)")).toBe("#000000")
    expect(oklchToHex("oklch(0.628 0.2577 29.23)")).toBe("#ff0000")
    expect(oklchToHex("#123456")).toBe("#123456")
  })

  it("gives every palette hex colours Satori can draw", () => {
    for (const key of Object.keys(PALETTES)) {
      const c = ogColors(key)
      for (const v of [c.ground, c.primary, c.ring, ...c.aurora]) expect(v, key).toMatch(HEX)
    }
  })

  it("maps every docs group and page to a real palette", () => {
    for (const g of GROUPS) expect(PALETTES[GROUP_PALETTE[g]], g).toBeDefined()
    for (const [key, p] of Object.entries(PAGES)) expect(PALETTES[p.palette], key).toBeDefined()
  })
})

describe("page metadata", () => {
  it("sets a large-image Twitter card and absolute base", () => {
    expect(rootMetadata.metadataBase?.toString()).toBe("https://glasscn.app/")
    expect(rootMetadata.twitter).toMatchObject({ card: "summary_large_image", creator: "@linesofcode" })
  })

  it("restates Open Graph and Twitter per page, with a canonical URL", () => {
    const m = pageMetadata({ title: "Button", description: "A button.", path: "/docs/button" })
    expect(m.alternates?.canonical).toBe("/docs/button")
    expect(m.openGraph).toMatchObject({ title: "Button · glasscn", description: "A button.", url: "/docs/button", siteName: "glasscn" })
    expect(m.twitter).toMatchObject({ card: "summary_large_image", title: "Button · glasscn" })
  })
})
