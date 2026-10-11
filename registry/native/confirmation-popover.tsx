import * as React from "react"
import { View } from "react-native"

import { Button } from "@/components/glass/native/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/glass/native/popover"
import { GText } from "@/components/glass/native/ui"

type Ctx = { close: () => void }
const ConfirmContext = React.createContext<Ctx>({ close: () => {} })

/** A confirmation anchored to the button that asked for it — an alert popover with Cancel and a (destructive) confirm. */
function ConfirmationPopover({ open, defaultOpen, onOpenChange, children }: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; children?: React.ReactNode }) {
  const [inner, setInner] = React.useState(defaultOpen ?? false)
  const value = open ?? inner
  const set = (v: boolean) => {
    setInner(v)
    onOpenChange?.(v)
  }
  return (
    <ConfirmContext.Provider value={{ close: () => set(false) }}>
      <Popover open={value} onOpenChange={set}>
        {children}
      </Popover>
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
