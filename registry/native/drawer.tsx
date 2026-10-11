import * as React from "react"
import { ScrollView, type ScrollViewProps } from "react-native"

import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, type SheetDetent } from "@/components/glass/native/sheet"

/** shadcn's Drawer API on the bottom Sheet: grabber, medium and large detents, drag to resize or dismiss. */
const Drawer = Sheet
const DrawerTrigger = SheetTrigger
const DrawerClose = SheetClose

const DEFAULT_DETENTS: SheetDetent[] = ["medium", "large"]

function DrawerContent({ detents = DEFAULT_DETENTS, ...props }: Omit<React.ComponentProps<typeof SheetContent>, "side">) {
  return <SheetContent side="bottom" detents={detents} {...props} />
}

/** The scrolling middle (web's DrawerBody). */
function DrawerBody({ style, contentContainerStyle, ...props }: ScrollViewProps) {
  return <ScrollView style={[{ flex: 1 }, style]} contentContainerStyle={[{ paddingHorizontal: 20, gap: 12 }, contentContainerStyle]} keyboardShouldPersistTaps="handled" {...props} />
}

const DrawerHeader = SheetHeader
const DrawerFooter = SheetFooter
const DrawerTitle = SheetTitle
const DrawerDescription = SheetDescription

export { Drawer, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, DrawerTitle, DrawerDescription }
