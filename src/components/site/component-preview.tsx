"use client"

import * as React from "react"
import { cn } from "cn"

import { Aurora } from "@/components/glass/aurora"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/glass/tabs"
import { CopyButton } from "./copy-button"

/**
 * Preview | Code for one item: the live demo on its own patch of aurora, or the demo's highlighted source.
 * The demo arrives as `children`, rendered by the server page — so a docs page ships only its own demo's
 * client code, never the whole `demos` map.
 */
export function ComponentPreview({ children, html, code, wide = false }: { children?: React.ReactNode; html?: string; code?: string; wide?: boolean }) {
  return (
    <Tabs defaultValue="preview" className="gap-3">
      <TabsList>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        {html ? <TabsTrigger value="code">Code</TabsTrigger> : null}
      </TabsList>
      <TabsContent value="preview">
        <div
          className={cn(
            // an aurora ground, not a glass pane: the demo's glass is the only glass (UX-06)
            "@container relative isolate flex min-h-72 items-center justify-center overflow-hidden rounded-3xl border border-glass-border",
            wide ? "p-4 sm:p-8" : "p-6 sm:p-12"
          )}
        >
          <Aurora className="absolute -z-10" />
          {children ?? <p className="text-muted-foreground">No preview.</p>}
        </div>
      </TabsContent>
      {html && code ? (
        <TabsContent value="code">
          <div className="glass-subtle relative overflow-hidden rounded-3xl [--glass-elevation:0_0_#0000]">
            <CopyButton value={code} className="absolute top-2 right-2 z-10" />
            <div tabIndex={0} className="max-h-[560px] overflow-auto px-5 py-4 font-mono text-[0.8rem] leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </TabsContent>
      ) : null}
    </Tabs>
  )
}
