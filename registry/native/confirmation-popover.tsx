import * as React from "react"
import { View, useWindowDimensions } from "react-native"

import { ActionSheet, ActionSheetAction, ActionSheetCancel, ActionSheetContent, ActionSheetDescription, ActionSheetHeader, ActionSheetTitle } from "@/components/glass/native/action-sheet"
import { Button } from "@/components/glass/native/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/glass/native/popover"
import { GText } from "@/components/glass/native/ui"

type Ctx = { close: () => void }
const ConfirmContext = React.createContext<Ctx>({ close: () => {} })

/**
 * A confirmation anchored to the button that asked for it — an alert popover with Cancel
 * and a (destructive) confirm. On phones (< 600pt wide) it's an action sheet instead, Apple's idiom.
 */
function ConfirmationPopover({ open, defaultOpen, onOpenChange, children }: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; children?: React.ReactNode }) {
  const [inner, setInner] = React.useState(defaultOpen ?? false)
  const value = open ?? inner
  const set = (v: boolean) => {
    setInner(v)
    onOpenChange?.(v)
  }
  return (
    <ConfirmContext.Provider value={{ close: () => set(false) }}>
      <ActionSheet open={value} onOpenChange={set}>
        <Popover open={value} onOpenChange={set}>
          {children}
        </Popover>
      </ActionSheet>
    </ConfirmContext.Provider>
  )
}

const ConfirmationPopoverTrigger = PopoverTrigger

function ConfirmationPopoverContent({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "destructive",
  onConfirm,
  onCancel,
  children,
  ...props
}: Omit<React.ComponentProps<typeof PopoverContent>, "children"> & {
  title: React.ReactNode
  description?: React.ReactNode
  confirmLabel?: React.ReactNode
  cancelLabel?: React.ReactNode
  variant?: "destructive" | "default"
  onConfirm?: () => void
  onCancel?: () => void
  children?: React.ReactNode
}) {
  const { close } = React.useContext(ConfirmContext)
  const { width } = useWindowDimensions()
  if (width < 600) {
    return (
      <ActionSheetContent>
        <ActionSheetHeader>
          <ActionSheetTitle>{title}</ActionSheetTitle>
          {description ? <ActionSheetDescription>{description}</ActionSheetDescription> : null}
        </ActionSheetHeader>
        {children}
        <ActionSheetAction variant={variant === "destructive" ? "destructive" : "preferred"} onPress={() => onConfirm?.()}>
          {confirmLabel}
        </ActionSheetAction>
        <ActionSheetCancel onPress={() => onCancel?.()}>{cancelLabel}</ActionSheetCancel>
      </ActionSheetContent>
    )
  }
  return (
    <PopoverContent role="alertdialog" style={{ width: 256 }} {...props}>
      <View style={{ gap: 4 }}>
        <GText font="heading" size="base">
          {title}
        </GText>
        {description ? (
          <GText size="sm" tone="muted">
            {description}
          </GText>
        ) : null}
      </View>
      {children}
      <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
        <Button
          variant="secondary"
          size="sm"
          onPress={() => {
            onCancel?.()
            close()
          }}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={variant === "destructive" ? "destructive" : "default"}
          size="sm"
          onPress={() => {
            onConfirm?.()
            close()
          }}
        >
          {confirmLabel}
        </Button>
      </View>
    </PopoverContent>
  )
}

export { ConfirmationPopover, ConfirmationPopoverTrigger, ConfirmationPopoverContent }
