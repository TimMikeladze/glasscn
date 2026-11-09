import * as React from "react"
import { render, waitFor } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"

import { GlassCluster, GlassClusterItem } from "@/components/glass/glass-cluster"

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

it("keeps measuring the shared material when the consumer supplies a ref", async () => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(() => new DOMRect(0, 0, 160, 72))
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => setTimeout(() => callback(0), 0))
  vi.stubGlobal("cancelAnimationFrame", clearTimeout)
  const ref = React.createRef<HTMLDivElement>()
  const { container } = render(<GlassCluster ref={ref}><GlassClusterItem>First</GlassClusterItem><GlassClusterItem>Second</GlassClusterItem></GlassCluster>)
  expect(ref.current?.dataset.slot).toBe("glass-cluster")
  await waitFor(() => expect(container.querySelector('[data-slot="glass-cluster-surface"]')).not.toBeNull())
})
