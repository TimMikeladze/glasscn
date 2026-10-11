import * as React from "react"
import { Animated, Platform, StyleSheet, View, useWindowDimensions, type ViewProps } from "react-native"

import { Button } from "@/components/glass/native/button"
import { DialogPortal, glassOpacity, textChildren, useControllableOpen, usePresence } from "@/components/glass/native/dialog"
import { Glass } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { GText, useUI, type GTextProps } from "@/components/glass/native/ui"

type Size = "default" | "sm"
type AlertCtx = { open: boolean; setOpen: (open: boolean) => void; titleId: string; descriptionId: string }
const AlertContext = React.createContext<AlertCtx | null>(null)
function useAlert() {
  const ctx = React.useContext(AlertContext)
  if (!ctx) throw new Error("AlertDialog parts must be inside <AlertDialog>")
  return ctx
}

/** How the footer lays its buttons out; Action and Cancel read it to size themselves. */
const FooterContext = React.createContext<"stack" | "row" | "split">("row")
const SizeContext = React.createContext<Size>("default")

export type AlertDialogProps = { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; children?: React.ReactNode }

/**
 * shadcn's AlertDialog as an Apple alert: a bold, start-aligned title, a short
 * message and up to three capsule buttons. Only the buttons close it — no
 * backdrop dismiss; hardware back / Escape cancel. Root holds open state,
 * controlled (`open`/`onOpenChange`) or not (`defaultOpen`).
 */
function AlertDialog({ open, defaultOpen, onOpenChange, children }: AlertDialogProps) {
  const [value, setOpen] = useControllableOpen(open, defaultOpen, onOpenChange)
  const id = React.useId().replace(/:/g, "")
  const ctx = React.useMemo(() => ({ open: value, setOpen, titleId: `alert-title-${id}`, descriptionId: `alert-description-${id}` }), [value, setOpen, id])
  return <AlertContext.Provider value={ctx}>{children}</AlertContext.Provider>
}

type PressProps = Omit<React.ComponentProps<typeof Press>, "children"> & { children?: React.ReactNode }

/** Opens the alert. Wrap any non-pressable content (a styled View, text); strings become GText. */
function AlertDialogTrigger({ children, onPress, ...props }: PressProps) {
  const { open, setOpen } = useAlert()
  return (
    <Press
      accessibilityRole="button"
      aria-expanded={open}
      aria-haspopup="dialog"
      {...props}
      onPress={(e) => {
        onPress?.(e)
        setOpen(true)
      }}
    >
      {textChildren(children)}
    </Press>
  )
}

/** Renders above everything (an RN Modal). */
const AlertDialogPortal = DialogPortal

/**
 * The page dims behind the alert (the web's --glass-dim: 15% light, 45% dark).
 * Not pressable, no blur — the panel already frosts. A sibling of the glass, so fading it is safe.
 */
function AlertDialogOverlay({ progress }: { progress: Animated.Value }) {
  const ui = useUI()
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: progress, backgroundColor: ui.scheme === "dark" ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.15)" }]} />
}

/** Centred strong-glass panel: rises and scales in (fades only where glass may fade — never Liquid Glass). */
function AlertDialogContent({ style, children, size = "default", ...props }: ViewProps & { size?: Size }) {
  const ui = useUI()
  const { open, setOpen, titleId, descriptionId } = useAlert()
  const { mounted, progress } = usePresence(open)
  const { width } = useWindowDimensions()
  const pad = size === "sm" ? 20 : 24
  // Screen readers: an alert on iOS/Android, an alertdialog on the web (react-native-web).
  const a11y = Platform.OS === "web" ? ({ role: "alertdialog", "aria-labelledby": titleId, "aria-describedby": descriptionId } as const) : ({ accessibilityRole: "alert" } as const)
  return (
    <AlertDialogPortal visible={mounted} onRequestClose={() => setOpen(false)}>
      <View style={styles.center} pointerEvents="box-none">
        <AlertDialogOverlay progress={progress} />
        <Animated.View
          style={{
            width: Math.min(width - 32, size === "sm" ? 320 : 448),
            opacity: glassOpacity(progress),
            transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }, { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
          }}
        >
          <SizeContext.Provider value={size}>
            <Glass radius={ui.radius.surface} tint={ui.glassStrong} accessibilityViewIsModal aria-modal {...a11y} style={[{ padding: pad, gap: 16 }, style]} {...props}>
              {textChildren(children)}
            </Glass>
          </SizeContext.Provider>
        </Animated.View>
      </View>
    </AlertDialogPortal>
  )
}

/** Media, title and message, start-aligned. */
function AlertDialogHeader({ style, ...props }: ViewProps) {
  return <View style={[{ gap: 6, alignItems: "flex-start" }, style]} {...props} />
}

/** An icon tile above the title, on a fill (never more glass inside the panel). */
function AlertDialogMedia({ style, ...props }: ViewProps) {
  const ui = useUI()
  return <View style={[{ width: ui.control.lg, height: ui.control.lg, marginBottom: 6, borderRadius: ui.radius.control, borderCurve: "continuous", alignItems: "center", justifyContent: "center", backgroundColor: ui.fill }, style]} {...props} />
}

/**
 * The buttons — write Cancel first, then the action. Stacked on phones (the
 * action on top, Cancel at the bottom), a trailing row with Cancel leading from
 * 640pt; `size="sm"` puts two side by side at equal width.
 */
function AlertDialogFooter({ style, children, ...props }: ViewProps) {
  const size = React.useContext(SizeContext)
  const { width } = useWindowDimensions()
  const layout = size === "sm" ? "split" : width >= 640 ? "row" : "stack"
  return (
    <FooterContext.Provider value={layout}>
      <View style={[{ flexDirection: layout === "stack" ? "column-reverse" : "row", justifyContent: "flex-end", gap: 8, paddingTop: 8 }, style]} {...props}>
        {textChildren(children)}
      </View>
    </FooterContext.Provider>
  )
}

/** Heading type, text-lg; keep it to two lines. */
function AlertDialogTitle(props: GTextProps) {
  const { titleId } = useAlert()
  return <GText font="heading" size="lg" accessibilityRole="header" nativeID={titleId} {...props} />
}

/** Muted supporting text, text-sm. */
function AlertDialogDescription(props: GTextProps) {
  const { descriptionId } = useAlert()
  return <GText size="sm" tone="muted" nativeID={descriptionId} {...props} />
}

type ButtonProps = React.ComponentProps<typeof Button>

/** Fills the footer's slot: full width when stacked, an equal share when split. */
function useSlotStyle() {
  const layout = React.useContext(FooterContext)
  return layout === "stack" ? { alignSelf: "stretch" as const } : layout === "split" ? { flex: 1, alignSelf: "auto" as const } : null
}

/** The default action, then closes. `variant="destructive"` for a destructive one (tinted, not solid). */
function AlertDialogAction({ variant = "default", onPress, style, ...props }: ButtonProps) {
  const { setOpen } = useAlert()
  const slot = useSlotStyle()
  return (
    <Button
      variant={variant}
      {...props}
      style={[slot, style]}
      onPress={(e) => {
        onPress?.(e)
        setOpen(false)
      }}
    />
  )
}

/** Cancel: a fill button (`secondary`) — never glass on the glass panel. */
function AlertDialogCancel({ variant = "secondary", onPress, style, ...props }: ButtonProps) {
  const { setOpen } = useAlert()
  const slot = useSlotStyle()
  return (
    <Button
      variant={variant}
      {...props}
      style={[slot, style]}
      onPress={(e) => {
        onPress?.(e)
        setOpen(false)
      }}
    />
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
})

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
