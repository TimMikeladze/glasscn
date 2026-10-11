import * as React from "react"
import { TextInput, View } from "react-native"
import { CopyIcon, PenIcon, SettingsIcon, ShareIcon, Trash2Icon } from "lucide-react-native"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/glass/native/alert-dialog"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/glass/native/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/glass/native/dropdown-menu"
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/glass/native/popover"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/glass/native/sheet"
import { Press } from "@/components/glass/native/press"
import { Button } from "@/components/glass/native/button"
import { toast } from "@/components/glass/native/toaster"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/glass/native/tooltip"
import { GText, alpha, useUI } from "@/components/glass/native/ui"
import type { Demo } from "@/sandbox/demos/types"
import { Body, Section } from "@/sandbox/ui"

/** A button face for triggers (the trigger itself is the pressable). */
function Face({ children, variant = "glass", icon }: { children?: React.ReactNode; variant?: "glass" | "primary" | "destructive"; icon?: boolean }) {
  const ui = useUI()
  const bg = variant === "primary" ? ui.primary : variant === "destructive" ? ui.destructive : ui.fillStrong
  const color = variant === "primary" ? ui.primaryForeground : variant === "destructive" ? ui.destructiveForeground : ui.foreground
  return (
    <View style={{ height: ui.control.default, minWidth: icon ? ui.control.default : undefined, paddingHorizontal: icon ? 0 : ui.pad.default, borderRadius: ui.radius.button, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
      {typeof children === "string" ? (
        <GText size="sm" weight="600" color={color}>
          {children}
        </GText>
      ) : (
        children
      )}
    </View>
  )
}

const Row = ({ children }: { children: React.ReactNode }) => <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, alignItems: "center" }}>{children}</View>

function EraseDialog() {
  return (
    <Dialog>
      <DialogTrigger>
        <Face>Start over</Face>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Erase every night?</DialogTitle>
          <DialogDescription>311 nights and all settings will be removed from this device. This can’t be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>
            <Face>Cancel</Face>
          </DialogClose>
          <DialogClose onPress={() => toast.error("Everything erased")}>
            <Face variant="destructive">Erase everything</Face>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ControlledDialog() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Row>
        <Press onPress={() => setOpen(true)} accessibilityRole="button">
          <Face>Open (controlled)</Face>
        </Press>
        <Body>open: {String(open)}</Body>
      </Row>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Controlled</DialogTitle>
            <DialogDescription>No corner close — the footer's built-in Close button, the backdrop, Escape or back.</DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </>
  )
}

function SideSheet({ side }: { side: "top" | "right" | "bottom" | "left" }) {
  const ui = useUI()
  return (
    <Sheet>
      <SheetTrigger>
        <Face>{side}</Face>
      </SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>New area</SheetTitle>
          <SheetDescription>Something you’re getting better at.</SheetDescription>
        </SheetHeader>
        <View style={{ gap: 8, paddingHorizontal: 20 }}>
          <GText size="sm" weight="600">
            Name
          </GText>
          <TextInput placeholder="Jiu-jitsu" placeholderTextColor={ui.mutedForeground} style={{ height: ui.control.default, borderRadius: ui.radius.control, paddingHorizontal: 12, backgroundColor: ui.fill, color: ui.foreground }} />
        </View>
        <SheetFooter>
          <SheetClose onPress={() => toast.success("Area added")}>
            <Face variant="primary">Add area</Face>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function DetentSheet({ native = true, guarded, controlled, inspector }: { native?: boolean; guarded?: boolean; controlled?: boolean; inspector?: boolean }) {
  const [detent, setDetent] = React.useState(0)
  const label = inspector ? "Inspector (modal false)" : guarded ? "Guarded dismiss" : controlled ? `Controlled detent: ${detent}` : native ? "Detents (system sheet)" : "Detents (native={false})"
  return (
    <Sheet>
      <SheetTrigger>
        <Face>{label}</Face>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        native={native}
        detents={["medium", "large", 0.3]}
        detent={controlled ? detent : undefined}
        onDetentChange={setDetent}
        modal={!inspector}
        onBeforeDismiss={guarded ? () => new Promise<boolean>((resolve) => resolve(confirmDismiss())) : undefined}
      >
        <SheetHeader>
          <SheetTitle>Tonight’s entry</SheetTitle>
          <SheetDescription>Drag the grabber between detents; tap it to cycle; drag down to dismiss.</SheetDescription>
        </SheetHeader>
        <View style={{ paddingHorizontal: 20 }}>
          <Body>Detent index: {detent}</Body>
        </View>
      </SheetContent>
    </Sheet>
  )
}

let dismissals = 0
/** Keeps the sheet on every other attempt, to show onBeforeDismiss. */
function confirmDismiss() {
  dismissals++
  if (dismissals % 2) {
    toast.warning("Kept — drag again to dismiss")
    return false
  }
  return true
}

function LongDialog() {
  const ui = useUI()
  return (
    <Dialog>
      <DialogTrigger>
        <Face>Long form + keyboard</Face>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tonight’s reflection</DialogTitle>
          <DialogDescription>Caps at the window height and scrolls; rides above the keyboard.</DialogDescription>
        </DialogHeader>
        {Array.from({ length: 8 }, (_, i) => (
          <TextInput key={i} placeholder={`Line ${i + 1}`} placeholderTextColor={ui.mutedForeground} style={{ height: ui.control.default, borderRadius: ui.radius.control, paddingHorizontal: 12, backgroundColor: ui.fill, color: ui.foreground }} />
        ))}
        <DialogFooter>
          <DialogClose>
            <Face variant="primary">Save</Face>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SymbolMenu({ native }: { native: boolean }) {
  return (
    <DropdownMenu native={native}>
      <DropdownMenuTrigger>
        <Face>{native ? "System menu" : "Glass menu (native={false})"}</Face>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem systemImage="square.and.arrow.up" onSelect={() => toast("Shared")}>
          Share
        </DropdownMenuItem>
        <DropdownMenuItem systemImage="doc.on.doc" onSelect={() => toast("Copied")}>
          Copy
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" systemImage="trash" onSelect={() => toast.error("Deleted")}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CustomMenu() {
  const ui = useUI()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Face>Custom content → glass</Face>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <View style={{ padding: 10, flexDirection: "row", gap: 6 }}>
          {ui.charts.slice(0, 5).map((c) => (
            <View key={c} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c }} />
          ))}
        </View>
        <DropdownMenuItem onSelect={() => toast("Picked")}>Pick colour</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function WeekPopover({ align, side }: { align?: "start" | "center" | "end"; side?: "top" | "right" | "bottom" | "left" }) {
  return (
    <Popover>
      <PopoverTrigger>
        <Face>{`${side ?? "bottom"} · ${align ?? "center"}`}</Face>
      </PopoverTrigger>
      <PopoverContent side={side} align={align} style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <GText font="display" size="xl">
          5/7
        </GText>
        <View style={{ flex: 1 }}>
          <GText size="sm" weight="600">
            Five nights written
          </GText>
          <GText size="sm" tone="muted">
            Two more for a perfect week.
          </GText>
        </View>
      </PopoverContent>
    </Popover>
  )
}

function AnchoredPopover() {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <View style={{ gap: 8 }}>
        <PopoverTrigger>
          <Face>Controlled, custom anchor</Face>
        </PopoverTrigger>
        <PopoverAnchor style={{ alignSelf: "stretch", height: 8, borderRadius: 4, backgroundColor: "rgba(127,127,127,0.25)" }} />
      </View>
      <PopoverContent align="start">
        Anchored to the bar, not the button. open: {String(open)}
      </PopoverContent>
    </Popover>
  )
}

function SettingsTip() {
  const ui = useUI()
  return (
    <Tooltip>
      <TooltipTrigger accessibilityLabel="Settings">
        <Face icon>
          <SettingsIcon size={18} color={ui.foreground} />
        </Face>
      </TooltipTrigger>
      <TooltipContent>
        Settings
        <View style={{ paddingHorizontal: 6, borderRadius: 6, backgroundColor: ui.fill }}>
          <GText size="xs" font="mono">
            ,
          </GText>
        </View>
      </TooltipContent>
    </Tooltip>
  )
}

function NightMenu() {
  const [kept, setKept] = React.useState(true)
  const [mood, setMood] = React.useState("calm")
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Face>This night</Face>
      </DropdownMenuTrigger>
      <DropdownMenuContent style={{ width: 240 }}>
        <DropdownMenuLabel>Thursday, Oct 8</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => toast("Rewriting")}>
            <PenIcon /> Rewrite <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => toast("Copied as text")}>
            <CopyIcon /> Copy as text
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ShareIcon /> Share
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Messages</DropdownMenuItem>
              <DropdownMenuItem>Mail</DropdownMenuItem>
              <DropdownMenuItem disabled>AirDrop (off)</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={kept} onCheckedChange={setKept}>
          Promise kept
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel inset>Mood</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={mood} onValueChange={setMood}>
          <DropdownMenuRadioItem value="calm" inset onSelect={(e) => e.preventDefault()}>
            Calm
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="tired" inset onSelect={(e) => e.preventDefault()}>
            Tired
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => toast.error("Night deleted")}>
          <Trash2Icon /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Toasts() {
  return (
    <Row>
      <Pressish label="Seal tonight" primary onPress={() => toast.success("Tonight is sealed", { description: "Day 401 · a 3-night chain" })} />
      <Pressish label="Copy" onPress={() => toast("Copied as text")} />
      <Pressish label="Info" onPress={() => toast.info("Reminder at 21:30")} />
      <Pressish label="Warning" onPress={() => toast.warning("Storage almost full")} />
      <Pressish label="Error" onPress={() => toast.error("Couldn’t export", { description: "Try again in a moment." })} />
      <Pressish label="Undo action" onPress={() => toast("Night deleted", { action: { label: "Undo", onClick: () => toast.success("Restored") } })} />
      <Pressish
        label="Loading → success"
        onPress={() => {
          const id = toast.loading("Exporting…")
          setTimeout(() => toast.success("Exported 311 nights", { id }), 1500)
        }}
      />
      <Pressish label="Dismiss all" onPress={() => toast.dismiss()} />
    </Row>
  )
}

function ToastOverDialog() {
  return (
    <Dialog>
      <DialogTrigger onPress={() => setTimeout(() => toast.info("Above the dialog"), 600)}>
        <Face>Dialog + toast</Face>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Under the toast</DialogTitle>
          <DialogDescription>The toast floats in its own window above this modal on iOS.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

function Pressish({ label, onPress, primary }: { label: string; onPress: () => void; primary?: boolean }) {
  return (
    <Press onPress={onPress} accessibilityRole="button">
      <Face variant={primary ? "primary" : "glass"}>{label}</Face>
    </Press>
  )
}

function ControlledTip() {
  const [open, setOpen] = React.useState(false)
  return (
    <Row>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger>
          <Face>Anchor</Face>
        </TooltipTrigger>
        <TooltipContent side="right">Hello</TooltipContent>
      </Tooltip>
      <Button variant="secondary" size="sm" onPress={() => setOpen((o) => !o)}>
        {open ? "Hide" : "Show"}
      </Button>
    </Row>
  )
}

function DeleteNotesAlert() {
  const ui = useUI()
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Face>Delete notes</Face>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia style={{ backgroundColor: alpha(ui.destructive, 0.14) }}>
            <Trash2Icon size={24} color={ui.destructive} />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete 3 notes?</AlertDialogTitle>
          <AlertDialogDescription>These notes will be removed from all your devices. This can’t be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onPress={() => toast.error("3 notes deleted")}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function SmallAlert() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Face>Sign out (sm)</Face>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out?</AlertDialogTitle>
          <AlertDialogDescription>Your journal stays synced.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onPress={() => toast("Signed out")}>Sign out</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function ControlledAlert() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Row>
        <Press onPress={() => setOpen(true)} accessibilityRole="button">
          <Face>Unsaved entry (controlled)</Face>
        </Press>
        <Body>open: {String(open)}</Body>
      </Row>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save today’s entry?</AlertDialogTitle>
            <AlertDialogDescription>You have unsaved changes. Three buttons at most: the default on top, Cancel at the bottom.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive">Discard</AlertDialogAction>
            <AlertDialogAction onPress={() => toast.success("Entry saved")}>Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export const demos: Record<string, Demo> = {
  dialog: {
    title: "Dialog",
    render: () => (
      <>
        <Section title="Destructive confirm" note="Backdrop tap, Escape (web) and back (Android) close it; rises + scales in, never fades on Liquid Glass.">
          <EraseDialog />
        </Section>
        <Section title="Controlled · footer close">
          <ControlledDialog />
        </Section>
        <Section title="Long content · keyboard" note="maxHeight + a scrolling body; KeyboardAvoidingView (keyboard-controller). VoiceOver lands on the title.">
          <LongDialog />
        </Section>
      </>
    ),
  },
  "alert-dialog": {
    title: "Alert dialog",
    render: () => (
      <>
        <Section title="Destructive confirm" note="Only the buttons close it — no backdrop tap; Escape (web) and back (Android) cancel. Never fades on Liquid Glass.">
          <DeleteNotesAlert />
        </Section>
        <Section title="size sm" note="Two buttons side by side at equal width.">
          <SmallAlert />
        </Section>
        <Section title="Controlled · three buttons">
          <ControlledAlert />
        </Section>
      </>
    ),
  },
  sheet: {
    title: "Sheet",
    render: () => (
      <>
        <Section title="Sides" note="Inset from the edges like an iPad sheet, clear of the safe area.">
          <Row>
            <SideSheet side="right" />
            <SideSheet side="left" />
            <SideSheet side="top" />
            <SideSheet side="bottom" />
          </Row>
        </Section>
        <Section title="Detents" note="iOS/Android: the system sheet (@expo/ui BottomSheet). native={false}, a controlled detent or onBeforeDismiss use the Reanimated sheet: drag, rubber-band, tap the grabber to cycle.">
          <Row>
            <DetentSheet />
            <DetentSheet native={false} />
            <DetentSheet controlled />
            <DetentSheet guarded />
            <DetentSheet inspector native={false} />
          </Row>
        </Section>
      </>
    ),
  },
  popover: {
    title: "Popover",
    render: () => (
      <>
        <Section title="Sides and aligns" note="Anchored with measureInWindow; flips to the other side when it won't fit.">
          <Row>
            <WeekPopover />
            <WeekPopover align="start" />
            <WeekPopover align="end" />
            <WeekPopover side="top" />
            <WeekPopover side="right" />
          </Row>
        </Section>
        <Section title="PopoverAnchor · controlled">
          <AnchoredPopover />
        </Section>
      </>
    ),
  },
  tooltip: {
    title: "Tooltip",
    render: () => (
      <TooltipProvider>
        <Section title="Settings" note="Hover on web and iPad pointers (after delayDuration); long-press on Android only. Everywhere the tip is the trigger's accessibilityHint.">
          <Row>
            <SettingsTip />
            <Tooltip delayDuration={0}>
              <TooltipTrigger>
                <Face>Bottom, no delay</Face>
              </TooltipTrigger>
              <TooltipContent side="bottom">Shows instantly below</TooltipContent>
            </Tooltip>
          </Row>
        </Section>
        <Section title="Controlled" note="open/onOpenChange from outside the trigger.">
          <ControlledTip />
        </Section>
      </TooltipProvider>
    ),
  },
  "dropdown-menu": {
    title: "Dropdown menu",
    render: () => (
      <>
        <Section title="This night" note="Items with icons and shortcuts, a sub-menu (expands in place), checkbox and radio items, destructive.">
          <NightMenu />
        </Section>
        <Section title="System or glass" note="Plain items open the system menu on iOS/Android (SF Symbols via systemImage); custom content, a controlled open or native={false} the liquid-glass menu. Rows are 44pt, labels sentence case, a selection tick on choose.">
          <Row>
            <SymbolMenu native />
            <SymbolMenu native={false} />
            <CustomMenu />
          </Row>
        </Section>
      </>
    ),
  },
  toaster: {
    title: "Toaster",
    render: () => (
      <>
        <Section title="toast()" note="Tap the stack to fan it out; swipe sideways to dismiss. Spoken by the screen reader; success/warning/error buzz; above modals on iOS (FullWindowOverlay). Mount <Toaster /> once at the app root.">
          <Toasts />
        </Section>
        <Section title="Over a modal" note="Opens a dialog, then toasts — the toast sits above it.">
          <ToastOverDialog />
        </Section>
      </>
    ),
  },
}
