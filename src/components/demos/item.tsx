import { ChevronRightIcon, FileTextIcon, MicIcon } from "lucide-react"

import { Button } from "@/components/glass/button"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemSeparator, ItemTitle } from "@/components/glass/item"

export default function ItemDemo() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <FileTextIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Export your journal</ItemTitle>
          <ItemDescription>412 entries as Markdown, with photos.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="secondary">
            Export
          </Button>
        </ItemActions>
      </Item>
      <ItemGroup className="rounded-surface-sm bg-fill">
        {["Morning walk", "Call with Mum"].map((title, i) => (
          <div key={title} role="listitem">
            {i > 0 ? <ItemSeparator /> : null}
            <Item asChild size="sm">
              <a href="#entries">
                <ItemMedia variant="icon">
                  <MicIcon />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{title}</ItemTitle>
                  <ItemDescription>Voice note · 2 min</ItemDescription>
                </ItemContent>
                <ChevronRightIcon className="size-4 text-muted-foreground rtl:rotate-180" />
              </a>
            </Item>
          </div>
        ))}
      </ItemGroup>
    </div>
  )
}
