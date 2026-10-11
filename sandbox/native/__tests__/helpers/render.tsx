import * as React from "react"
import { render } from "@testing-library/react-native"
import { StyleSheet } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import type { TestInstance } from "test-renderer"

import { Glass } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { SandboxThemeProvider } from "@/sandbox/theme"

/** Render inside the sandbox's theme, like a screen does. */
const metrics = { frame: { x: 0, y: 0, width: 393, height: 852 }, insets: { top: 59, left: 0, right: 0, bottom: 34 } }
export const renderThemed = (ui: React.ReactElement) =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <SandboxThemeProvider>{ui}</SandboxThemeProvider>
    </SafeAreaProvider>
  )

type Fiber = { type: unknown; memoizedProps: Record<string, unknown> | null; child: Fiber | null; sibling: Fiber | null; return: Fiber | null }

const name = (f: Fiber) => {
  const t = f.type as { displayName?: string; name?: string } | string | null
  return typeof t === "string" ? t : (t?.displayName ?? t?.name ?? "?")
}

/** An opacity that fades: a number below 1, or an animated value (Animated / shared value). */
function fadingOpacity(style: unknown): string | null {
  if (!style) return null
  const flat = StyleSheet.flatten(style as never) as { opacity?: unknown } | undefined
  const o = flat?.opacity
  if (o === undefined || o === 1) return null
  return typeof o === "number" ? `opacity ${o}` : "animated opacity"
}

const liquidGlass = (f: Fiber) => {
  if (f.type !== Glass || !f.memoizedProps) return false
  const { variant, interactive } = f.memoizedProps as { variant?: string; interactive?: boolean }
  return variant === "liquid" || variant === "liquid-clear" || (!!interactive && variant === undefined)
}

/**
 * Rule 5 / NAT-51: Liquid Glass never sits under a `Press` that dims or any node whose
 * opacity is below 1 or animated (it stops rendering on iOS 26). Returns one line per offence.
 */
export function fadedLiquidGlass(root: TestInstance): string[] {
  const top = (root.unstable_fiber ?? (root.children.find((c) => typeof c !== "string") as TestInstance | undefined)?.unstable_fiber) as Fiber | null
  let fiber = top
  while (fiber?.return) fiber = fiber.return
  const found: string[] = []
  const visit = (f: Fiber | null) => {
    for (let n = f; n; n = n.sibling) {
      if (liquidGlass(n)) {
        for (let up = n.return; up; up = up.return) {
          const p = up.memoizedProps ?? {}
          if (up.type === Press && p.dim) found.push(`Press dim wraps Glass variant=${String((n.memoizedProps as { variant?: string }).variant ?? "interactive")}`)
          const fade = fadingOpacity(p.style)
          if (fade && typeof up.type === "string") found.push(`${fade} on <${name(up)}> above Glass variant=${String((n.memoizedProps as { variant?: string }).variant ?? "interactive")}`)
          else if (fade && (p.style as object) && typeof up.type !== "string" && /Animated/.test(name(up))) found.push(`${fade} on <${name(up)}> above Glass`)
        }
      }
      visit(n.child)
    }
  }
  visit(fiber)
  return [...new Set(found)]
}
