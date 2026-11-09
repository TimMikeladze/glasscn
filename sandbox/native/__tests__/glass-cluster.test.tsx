import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react-native"

import { Button } from "@/components/glass/native/button"
import { GlassCluster, GlassClusterItem } from "@/components/glass/native/glass-cluster"

it("groups separate native effects and keeps their actions independently usable", async () => {
  const add = jest.fn()
  await render(<GlassCluster spacing={4} mergeDistance={40}><GlassClusterItem onPress={add}>Add</GlassClusterItem><GlassClusterItem>Share</GlassClusterItem></GlassCluster>)
  expect(screen.getByTestId("GlassContainer").props.spacing).toBe(40)
  expect(screen.getAllByTestId("GlassView")).toHaveLength(2)
  await fireEvent.press(screen.getByRole("button", { name: "Add" }))
  expect(add).toHaveBeenCalledTimes(1)
})

it("supports an existing button as its action without nesting press targets", async () => {
  const action = jest.fn()
  await render(<GlassCluster><GlassClusterItem asChild><Button variant="ghost" onPress={action}>More</Button></GlassClusterItem></GlassCluster>)
  expect(screen.getAllByRole("button")).toHaveLength(1)
  await fireEvent.press(screen.getByRole("button", { name: "More" }))
  expect(action).toHaveBeenCalledTimes(1)
})
