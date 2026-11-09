import * as React from "react"
import { Text } from "react-native"
import { act, render, screen } from "@testing-library/react-native"

import { useGlassThemeOptions } from "@/components/glass/native/tokens"
import { SandboxThemeProvider, useSandboxTheme } from "@/sandbox/theme"

let mockUrl: string | null = null
// Linking.parse needs the Expo manifest, which Jest doesn't have; the query is all the provider reads
jest.mock("expo-linking", () => ({
  useLinkingURL: () => mockUrl,
  parse: (u: string) => ({ queryParams: Object.fromEntries(new URL(u.replace(/^exp:/, "http:")).searchParams) }),
}))

function Forced() {
  const { a11y } = useSandboxTheme()
  return <Text testID="forced">{Object.keys(a11y).filter((k) => a11y[k as keyof typeof a11y]).sort().join(",") || "none"}</Text>
}

const app = () => (
  <SandboxThemeProvider>
    <Forced />
  </SandboxThemeProvider>
)

test("a deep link's forced settings last until a later link leaves them out", async () => {
  mockUrl = "exp://127.0.0.1:8083/--/c/sheet?still=1&force=reduceTransparency"
  const view = await render(app())
  expect(screen.getByTestId("forced")).toHaveTextContent("reduceMotion,reduceTransparency")
  mockUrl = "exp://127.0.0.1:8083/--/c/sheet?force=reduceTransparency"
  await view.rerender(app())
  expect(screen.getByTestId("forced")).toHaveTextContent("reduceTransparency")
  mockUrl = "exp://127.0.0.1:8083/--/c/liquid-glass-01?scene=photos"
  await view.rerender(app())
  expect(screen.getByTestId("forced")).toHaveTextContent("none")
})

test("a setting turned on from the chips survives deep links", async () => {
  mockUrl = "exp://127.0.0.1:8083/--/tokens"
  let set: ReturnType<typeof useSandboxTheme>["setA11y"] = () => {}
  function Grab() {
    set = useSandboxTheme().setA11y
    return null
  }
  const tree = () => (
    <SandboxThemeProvider>
      <Grab />
      <Forced />
    </SandboxThemeProvider>
  )
  const view = await render(tree())
  await act(() => set("highContrast", true))
  mockUrl = "exp://127.0.0.1:8083/--/c/sheet?still=1"
  await view.rerender(tree())
  mockUrl = "exp://127.0.0.1:8083/--/c/sheet"
  await view.rerender(tree())
  expect(screen.getByTestId("forced")).toHaveTextContent("highContrast")
})

test("the scheme follows the OS until a link or the picker forces one (UX3-N18)", async () => {
  function Scheme() {
    return <Text testID="scheme">{useGlassThemeOptions().scheme ?? "os"}</Text>
  }
  const tree = () => (
    <SandboxThemeProvider>
      <Scheme />
    </SandboxThemeProvider>
  )
  mockUrl = "exp://127.0.0.1:8083/--/c/glass"
  const view = await render(tree())
  expect(screen.getByTestId("scheme")).toHaveTextContent("os")
  mockUrl = "exp://127.0.0.1:8083/--/c/glass?scheme=dark"
  await view.rerender(tree())
  expect(screen.getByTestId("scheme")).toHaveTextContent("dark")
  mockUrl = "exp://127.0.0.1:8083/--/c/glass?scheme=system"
  await view.rerender(tree())
  expect(screen.getByTestId("scheme")).toHaveTextContent("os")
})
