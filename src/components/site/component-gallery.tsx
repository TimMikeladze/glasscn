"use client"

import Link from "next/link"
import { ArrowUpRightIcon } from "lucide-react"

import { Badge } from "@/components/glass/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/glass/tabs"
import { demos } from "@/components/demos"

export interface GalleryItem {
  slug: string
  title: string
  description: string
  group: string
}

/** Every documented item, live, in tabs by group — each tile its docs demo plus a link to the page. */
export function ComponentGallery({ items }: { items: GalleryItem[] }) {
  const groups = [...new Set(items.map((i) => i.group))]
  return (
    <Tabs defaultValue={groups[0]} className="gap-6">
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <TabsList className="mx-auto">
          {groups.map((g) => (
            <TabsTrigger key={g} value={g}>
              {g} <span className="text-muted-foreground tabular-nums">{items.filter((i) => i.group === g).length}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {groups.map((g) => (
        <TabsContent key={g} value={g}>
          <div className="grid *:min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items
              .filter((i) => i.group === g)
              .map((item) => {
                const Demo = demos[item.slug]
                return (
                  <article key={item.slug} className="glass flex min-w-0 flex-col overflow-hidden rounded-surface">
                    <div className="relative flex min-h-64 flex-1 items-center justify-center overflow-hidden p-6">{Demo ? <Demo /> : null}</div>
                    <Link href={`/docs/${item.slug}`} className="group flex items-start gap-3 border-t border-glass-border px-5 py-4 transition-colors hover:bg-fill">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 font-semibold">
                          {item.title}
                          <Badge variant="secondary" className="font-mono font-normal">
                            {item.slug}
                          </Badge>
                        </div>
                        <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <ArrowUpRightIcon className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </article>
                )
              })}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
