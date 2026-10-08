import * as React from "react"
import { cn } from "cn"
import { Slot } from "radix-ui"

/**
 * Rich text — Markdown, MDX, a CMS — set in the theme's type: headings, links,
 * lists, quotes, code, tables, images, all from the type and colour tokens.
 * Line length is `--glass-measure`; pass `className="max-w-none"` to fill.
 */
function Prose({ asChild = false, className, ...props }: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div"
  return <Comp data-slot="prose" className={cn("glass-prose", className)} {...props} />
}

export { Prose }
