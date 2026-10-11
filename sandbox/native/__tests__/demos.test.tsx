import { DEMOS } from "@/sandbox/demos"

import { fadedLiquidGlass, renderThemed } from "./helpers/render"

// Every demo renders on iOS (with Liquid Glass available): no bare strings outside <Text>
// (native throws "Text strings must be rendered within a <Text> component"), and no
// Liquid Glass under a dimming Press or a fading ancestor (docs/rules/native.md 3).
describe.each(Object.entries(DEMOS))("%s demo", (_name, demo) => {
  it("renders every string inside <Text>", async () => {
    await renderThemed(<>{demo.render()}</>)
  })

  it("never fades Liquid Glass", async () => {
    const { root } = await renderThemed(<>{demo.render()}</>)
    expect(fadedLiquidGlass(root!)).toEqual([])
  })
})
