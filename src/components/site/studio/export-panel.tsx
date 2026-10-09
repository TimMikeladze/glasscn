"use client"

import * as React from "react"

import { SegmentedControl, SegmentedControlItem } from "@/components/glass/segmented-control"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/glass/tabs"
import { CodeBlockClient } from "@/components/site/code-block-client"
import { createGlassTheme, encodeTheme, fontDependencies, themeToCss, themeToRegistryItem, type CreateThemeOptions, type GlassTheme } from "@/lib/glass-theme"
import { itemUrl, registryUrl } from "@/lib/site"

/** The theme, five ways out: a one-line CLI install, CSS for globals.css, a shadcn theme item, the TypeScript that rebuilds it, a link. */
export function ExportPanel({ theme, recipe }: { theme: GlassTheme; recipe: CreateThemeOptions }) {
  const [scope, setScope] = React.useState<"diff" | "full">("diff")
  // the panel only renders in an opened dialog, so the window is there
  const origin = typeof window === "undefined" ? "" : window.location.origin
  const css = themeToCss(theme, { fontImport: true, ...(scope === "diff" ? { only: createGlassTheme() } : {}) })
  // Google fonts become registry dependencies on glasscn's font items — the CLI installs them as app fonts
  const item = JSON.stringify(themeToRegistryItem(theme, "my-glass-theme", "My glass theme", { fontItemUrl: itemUrl }), null, 2)
  const fonts = fontDependencies(theme)
  const ts = `import { createGlassTheme } from "@/lib/glass-theme"

export const theme = createGlassTheme(${JSON.stringify(recipe, null, 2)})`
  const code = encodeTheme(theme)
  const link = `${origin}/themes#t=${code}`
  // served by app/r/theme/[code] — the registry host, so the command works from any copy of the site
  const cli = `npx shadcn@latest add ${registryUrl}/r/theme/${code}.json`
  return (
    <Tabs defaultValue="cli" className="gap-3">
      <TabsList className="w-full">
        <TabsTrigger value="cli">CLI</TabsTrigger>
        <TabsTrigger value="css">CSS</TabsTrigger>
        <TabsTrigger value="item">shadcn item</TabsTrigger>
        <TabsTrigger value="ts">TypeScript</TabsTrigger>
        <TabsTrigger value="link">Link</TabsTrigger>
      </TabsList>
      <TabsContent value="cli" className="grid gap-3">
        <p className="text-sm text-muted-foreground">Run in your project — installs the theme (and its fonts) with the shadcn CLI.</p>
        <CodeBlockClient code={cli} title="terminal" />
      </TabsContent>
      <TabsContent value="css" className="grid gap-3">
        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>Paste into globals.css after the glass-style foundation.</span>
          <SegmentedControl size="sm" value={scope} onValueChange={(v) => setScope(v as "diff" | "full")} aria-label="Which tokens">
            <SegmentedControlItem value="diff">Changes</SegmentedControlItem>
            <SegmentedControlItem value="full">Everything</SegmentedControlItem>
          </SegmentedControl>
        </div>
        <CodeBlockClient code={css || "/* nothing differs from the default */"} title="globals.css" />
        {fonts.length ? (
          <p className="text-xs text-muted-foreground">
            Fonts: {fonts.map((f) => `${f.role} ${f.font.label}`).join(" · ")}. The @import loads them from Google Fonts — or use the shadcn item, which installs them with next/font.
          </p>
        ) : null}
      </TabsContent>
      <TabsContent value="item" className="grid gap-3">
        <p className="text-sm text-muted-foreground">
          Save as <code className="rounded-md bg-fill px-1.5 font-mono text-xs">my-glass-theme.json</code>, then{" "}
          <code className="rounded-md bg-fill px-1.5 font-mono text-xs">npx shadcn@latest add ./my-glass-theme.json</code> — or host it and share the URL.
        </p>
        <CodeBlockClient code={item} title="my-glass-theme.json" />
      </TabsContent>
      <TabsContent value="ts" className="grid gap-3">
        <p className="text-sm text-muted-foreground">Rebuild it at runtime with the theme engine, then wrap any subtree in a ThemeScope.</p>
        <CodeBlockClient code={ts} title="theme.ts" />
      </TabsContent>
      <TabsContent value="link" className="grid gap-3">
        <p className="text-sm text-muted-foreground">Opens this studio with the theme loaded.</p>
        <CodeBlockClient code={link} title="share link" />
      </TabsContent>
    </Tabs>
  )
}
