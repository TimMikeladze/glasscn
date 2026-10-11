import * as React from "react"
import { View, type ViewProps } from "react-native"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/glass/native/dropdown-menu"

type Ctx = { open: boolean; openFromLongPress: () => void }
const ContextMenuContext = React.createContext<Ctx | null>(null)

/**
 * Long-press (or right-click on web) opens the menu at the trigger; a plain tap doesn't.
 * iOS / Android: plain items open the system context menu (SwiftUI `ContextMenu` with its
 * lifted preview, Compose `DropdownMenu`); custom content or `native={false}` the glass menu.
 */
function ContextMenu({ onOpenChange, native = true, children }: { onOpenChange?: (open: boolean) => void; native?: boolean; children?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const allow = React.useRef(false)
  const change = (next: boolean) => {
    if (next && !allow.current) return
    allow.current = false
    setOpen(next)
    onOpenChange?.(next)
  }
  const ctx = {
    open,
    openFromLongPress: () => {
      allow.current = true
      change(true)
    },
  }
  return (
    <ContextMenuContext.Provider value={ctx}>
      <DropdownMenu open={open} onOpenChange={change} native={native} longPress>
        {children}
      </DropdownMenu>
    </ContextMenuContext.Provider>
  )
}

function ContextMenuTrigger({ children, ...props }: Omit<React.ComponentProps<typeof DropdownMenuTrigger>, "onLongPress">) {
  const ctx = React.useContext(ContextMenuContext)
  return (
    <DropdownMenuTrigger
      accessibilityActions={[{ name: "longpress", label: "Show menu" }]}
      onAccessibilityAction={() => ctx?.openFromLongPress()}
      onLongPress={() => ctx?.openFromLongPress()}
      {...({ onContextMenu: (e: { preventDefault?: () => void }) => (e.preventDefault?.(), ctx?.openFromLongPress()) } as object)}
      {...props}
    >
      {children}
    </DropdownMenuTrigger>
  )
}

Object.assign(ContextMenuTrigger, { menuPart: "trigger" })

/** The lifted preview: grows slightly while the menu is open. */
function ContextMenuPreview({ style, ...props }: ViewProps) {
  const ctx = React.useContext(ContextMenuContext)
  return <View style={[{ transform: [{ scale: ctx?.open ? 1.02 : 1 }] }, style]} {...props} />
}

const ContextMenuContent = DropdownMenuContent
const ContextMenuItem = DropdownMenuItem
const ContextMenuCheckboxItem = DropdownMenuCheckboxItem
const ContextMenuRadioItem = DropdownMenuRadioItem
const ContextMenuLabel = DropdownMenuLabel
const ContextMenuSeparator = DropdownMenuSeparator
const ContextMenuShortcut = DropdownMenuShortcut
const ContextMenuGroup = DropdownMenuGroup
const ContextMenuPortal = DropdownMenuPortal
const ContextMenuSub = DropdownMenuSub
const ContextMenuSubContent = DropdownMenuSubContent
const ContextMenuSubTrigger = DropdownMenuSubTrigger
const ContextMenuRadioGroup = DropdownMenuRadioGroup

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuPreview,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
