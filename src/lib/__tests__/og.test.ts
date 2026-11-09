import { describe, expect, it } from "vitest"

import { existsSync } from "node:fs"
import { join } from "node:path"

import { GROUPS } from "@/lib/docs"
import { pageMetadata, rootMetadata } from "@/lib/metadata"
import { ogColors, oklchToHex } from "@/lib/og/colors"
import { PAGES } from "@/lib/og/pages"
import { GROUP_CARD, OG_PHOTOS, OG_SCENES } from "@/lib/og/scenes"

const HEX = /^#[0-9a-f]{6}$/

describe("share cards", () => {
  it("converts OKLCH to sRGB hex", () => {
    expect(oklchToHex("oklch(1 0 0)")).toBe("#ffffff")
    expect(oklchToHex("oklch(0 0 0)")).toBe("#000000")
    expect(oklchToHex("oklch(0.628 0.2577 29.23)")).toBe("#ff0000")
    expect(oklchToHex("#123456")).toBe("#123456")
  })

  it("draws in hex Satori can read, with Apple's web blue as the accent", () => {
    const c = ogColors()
    for (const [k, v] of Object.entries(c)) expect(v, k).toMatch(HEX)
    expect(c.accent).not.toBe("#000000")
  })

  it("gives every docs group and page a shipped photo and a known scene", () => {
    for (const photo of OG_PHOTOS) expect(existsSync(join(process.cwd(), "public/showcase", `${photo}.jpg`)), photo).toBe(true)
    for (const g of GROUPS) {
      expect(OG_PHOTOS, g).toContain(GROUP_CARD[g].photo)
      expect(OG_SCENES, g).toContain(GROUP_CARD[g].scene)
    }
    for (const [key, p] of Object.entries(PAGES)) {
      expect(OG_PHOTOS, key).toContain(p.photo)
      expect(OG_SCENES, key).toContain(p.scene)
    }
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
