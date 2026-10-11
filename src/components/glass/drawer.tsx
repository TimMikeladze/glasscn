"use client"

import * as React from "react"

import { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, type SheetDetent } from "@/components/glass/sheet"

/**
 * shadcn's Drawer API on glasscn's bottom Sheet: a panel rising from the bottom with a grabber,
 * detents (medium and large by default) and drag-to-dismiss. No vaul — the sheet does the drag.
 * Everything Sheet takes works here; Drawer is the name shadcn users reach for.
 */
function Drawer(props: React.ComponentProps<typeof Sheet>) {
  return <Sheet data-slot="drawer" {...props} />
}

function DrawerTrigger(props: React.ComponentProps<typeof SheetTrigger>) {
  return <SheetTrigger data-slot="drawer-trigger" {...props} />
}

function DrawerClose(props: React.ComponentProps<typeof SheetClose>) {
  return <SheetClose data-slot="drawer-close" {...props} />
}

const DEFAULT_DETENTS: SheetDetent[] = ["medium", "large"]

function DrawerContent({ detents = DEFAULT_DETENTS, ...props }: Omit<React.ComponentProps<typeof SheetContent>, "side">) {
  return <SheetContent data-slot="drawer-content" side="bottom" detents={detents} {...props} />
}

function DrawerHeader(props: React.ComponentProps<typeof SheetHeader>) {
  return <SheetHeader data-slot="drawer-header" {...props} />
}

function DrawerBody(props: React.ComponentProps<typeof SheetBody>) {
  return <SheetBody data-slot="drawer-body" {...props} />
}

function DrawerFooter(props: React.ComponentProps<typeof SheetFooter>) {
  return <SheetFooter data-slot="drawer-footer" {...props} />
}

function DrawerTitle(props: React.ComponentProps<typeof SheetTitle>) {
  return <SheetTitle data-slot="drawer-title" {...props} />
}

function DrawerDescription(props: React.ComponentProps<typeof SheetDescription>) {
  return <SheetDescription data-slot="drawer-description" {...props} />
}

export { Drawer, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, DrawerTitle, DrawerDescription }
