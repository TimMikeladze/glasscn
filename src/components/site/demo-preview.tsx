"use client"

import * as React from "react"

type DemoModule = { default: React.ComponentType }
const modules = new Map<string, Promise<DemoModule>>()

/** Each demo file is its own chunk, fetched once. */
function loadDemo(name: string) {
  let mod = modules.get(name)
  if (!mod) {
    mod = import(`@/components/demos/${name}`) as Promise<DemoModule>
    modules.set(name, mod)
  }
  return mod
}

function Demo({ name }: { name: string }) {
  const { default: Component } = React.use(loadDemo(name))
  return <Component />
}

/**
 * The live demo for one docs page. A server component can't code-split the client components it
 * imports (every demo would land in every docs page's bundle), so the demo is loaded here by name:
 * the page still server-renders it, and ships only this demo's chunk.
 */
export function DemoPreview({ name }: { name: string }) {
  return (
    <React.Suspense fallback={<div className="h-48 w-full" aria-busy />}>
      <Demo name={name} />
    </React.Suspense>
  )
}
