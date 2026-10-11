import { View } from "react-native"

import { Glass } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"

import { fadedLiquidGlass, renderThemed } from "./helpers/render"

// The structural check itself: it must catch what demos.test.tsx relies on it to catch.
describe("fadedLiquidGlass", () => {
  it("flags a dimming Press and a faded ancestor over Liquid Glass", async () => {
    const { root } = await renderThemed(
      <View style={{ opacity: 0.5 }}>
        <Press dim>
          <Glass variant="liquid" />
        </Press>
      </View>
    )
    const found = fadedLiquidGlass(root!)
    expect(found.some((f) => f.startsWith("Press dim"))).toBe(true)
    expect(found.some((f) => f.startsWith("opacity 0.5"))).toBe(true)
  })

  it("allows material glass under a fade, and liquid glass under a plain Press", async () => {
    const { root } = await renderThemed(
      <View>
        <View style={{ opacity: 0.5 }}>
          <Glass />
        </View>
        <Press>
          <Glass variant="liquid" />
        </Press>
      </View>
    )
    expect(fadedLiquidGlass(root!)).toEqual([])
  })
})
