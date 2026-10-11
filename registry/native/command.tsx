import * as React from "react"
import { ScrollView, TextInput, View, type TextInputProps, type ViewProps } from "react-native"
import { SearchIcon } from "lucide-react-native"

import { Dialog, DialogContent, DialogDescription, DialogTitle, type DialogProps } from "@/components/glass/native/dialog"
import { Press, haptics } from "@/components/glass/native/press"
import { GText, alpha, useUI, web, type GTextProps } from "@/components/glass/native/ui"

/**
 * shadcn's Command for React Native: a search capsule that filters the items below it.
 * Transparent on its own; `CommandDialog` floats it in a glass dialog. Items match when
 * the query is a case-insensitive substring of their `value`, text or `keywords`.
 */

type CommandCtx = {
  query: string
  setQuery: (q: string) => void
  /** Ids of items that currently match — CommandEmpty shows when it's empty. */
  visible: Set<string>
  report: (id: string, on: boolean) => void
  shouldFilter: boolean
}
const CommandContext = React.createContext<CommandCtx | null>(null)
function useCommand() {
  const ctx = React.useContext(CommandContext)
  if (!ctx) throw new Error("Command parts must be inside <Command>")
  return ctx
}

function Command({ style, shouldFilter = true, children, ...props }: ViewProps & { shouldFilter?: boolean }) {
  const [query, setQuery] = React.useState("")
  const [visible, setVisible] = React.useState<Set<string>>(() => new Set())
  const report = React.useCallback((id: string, on: boolean) => {
    setVisible((prev) => {
      if (prev.has(id) === on) return prev
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])
  const ctx = React.useMemo(() => ({ query, setQuery, visible, report, shouldFilter }), [query, visible, report, shouldFilter])
  return (
    <CommandContext.Provider value={ctx}>
      <View style={[{ width: "100%", overflow: "hidden" }, style]} {...props}>
        {children}
      </View>
    </CommandContext.Provider>
  )
}

const CommandDialogContext = React.createContext(false)

/** ⌘K on the web; a search sheet here: Command in a glass dialog. */
function CommandDialog({ title = "Command palette", description = "Search for a command to run…", children, ...props }: DialogProps & { title?: string; description?: string }) {
  return (
    <Dialog {...props}>
      <DialogContent showCloseButton={false} style={{ padding: 0, gap: 0 }}>
        <View style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0 }}>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </View>
        <CommandDialogContext.Provider value>
          <Command>{children}</Command>
        </CommandDialogContext.Provider>
      </DialogContent>
    </Dialog>
  )
}

/** The search capsule. */
function CommandInput({ style, onChangeText, ...props }: TextInputProps) {
  const ui = useUI()
  const { query, setQuery } = useCommand()
  // in a CommandDialog the search takes the keyboard straight away
  const inDialog = React.useContext(CommandDialogContext)
  return (
    <View style={{ padding: 8, paddingBottom: 4 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, height: ui.control.default, borderRadius: ui.radius.button, backgroundColor: ui.fill, paddingHorizontal: 12 }}>
        <SearchIcon size={16} color={ui.mutedForeground} />
        <TextInput
          accessibilityRole="search"
          placeholderTextColor={alpha(ui.mutedForeground, 0.8)}
          selectionColor={ui.primary}
          cursorColor={ui.primary}
          autoCorrect={false}
          autoFocus={inDialog}
          returnKeyType="search"
          {...props}
          value={query}
          onChangeText={(t) => {
            setQuery(t)
            onChangeText?.(t)
          }}
          style={[{ flex: 1, height: "100%", fontSize: ui.text.base, color: ui.foreground }, web({ outlineStyle: "none" }), style]}
        />
      </View>
    </View>
  )
}

function CommandList({ style, children, ...props }: React.ComponentProps<typeof ScrollView>) {
  return (
    <ScrollView role="list" style={[{ maxHeight: 320, flexGrow: 0 }, style]} contentContainerStyle={{ padding: 6 }} keyboardShouldPersistTaps="handled" {...props}>
      {children}
    </ScrollView>
  )
}

function CommandEmpty({ children = "No results.", ...props }: GTextProps) {
  const { visible } = useCommand()
  if (visible.size) return null
  return (
    <GText size="sm" tone="muted" align="center" style={{ paddingVertical: 24 }} {...props}>
      {children}
    </GText>
  )
}

const GroupContext = React.createContext<{ report: (id: string, on: boolean) => void } | null>(null)

/** Related items under a muted heading; hides when none of them match. */
function CommandGroup({ heading, style, children, ...props }: ViewProps & { heading?: React.ReactNode }) {
  const [shown, setShown] = React.useState<Set<string>>(() => new Set())
  const report = React.useCallback((id: string, on: boolean) => {
    setShown((prev) => {
      if (prev.has(id) === on) return prev
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])
  const ctx = React.useMemo(() => ({ report }), [report])
  return (
    <GroupContext.Provider value={ctx}>
      <View role="group" style={[shown.size ? null : { display: "none" }, style]} {...props}>
        {heading ? (
          <GText size="xs" tone="muted" weight="600" style={{ paddingHorizontal: 10, paddingTop: 8, paddingBottom: 4, letterSpacing: 0.6, textTransform: "uppercase" }}>
            {heading}
          </GText>
        ) : null}
        {children}
      </View>
    </GroupContext.Provider>
  )
}

function CommandSeparator({ style, ...props }: ViewProps) {
  const ui = useUI()
  return <View style={[{ height: 1, marginVertical: 6, marginHorizontal: -6, backgroundColor: ui.separator }, style]} {...props} />
}

const textOf = (node: React.ReactNode): string =>
  typeof node === "string" || typeof node === "number" ? String(node) : Array.isArray(node) ? node.map(textOf).join(" ") : React.isValidElement<{ children?: React.ReactNode }>(node) ? textOf(node.props.children) : ""

/** A row: fills on press and hover, runs `onSelect(value)`. Strings become text; icons take the muted colour. */
function CommandItem({
  value,
  keywords = [],
  disabled,
  onSelect,
  style,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Press>, "children" | "onPress"> & { value?: string; keywords?: string[]; disabled?: boolean; onSelect?: (value: string) => void; children?: React.ReactNode }) {
  const ui = useUI()
  const { query, report, shouldFilter } = useCommand()
  const group = React.useContext(GroupContext)
  const id = React.useId()
  const [hover, setHover] = React.useState(false)
  const label = value ?? textOf(children)
  const q = query.trim().toLowerCase()
  const match = !shouldFilter || !q || [label, ...keywords].some((k) => k.toLowerCase().includes(q))
  React.useEffect(() => {
    report(id, match)
    group?.report(id, match)
    return () => {
      report(id, false)
      group?.report(id, false)
    }
  }, [id, match, report, group])
  if (!match) return null
  return (
    <Press
      role="option"
      aria-disabled={!!disabled}
      disabled={disabled}
      squash={0.99}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      onPressIn={() => setHover(true)}
      onPressOut={() => setHover(false)}
      onPress={() => {
        haptics.selection()
        onSelect?.(label)
      }}
      style={[
        { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 44, paddingHorizontal: 10, borderRadius: ui.radius.control - 4, backgroundColor: hover ? ui.fillStrong : "transparent", opacity: disabled ? 0.5 : 1 },
        web({ cursor: disabled ? "default" : "pointer", outlineStyle: "none" }),
        style,
      ]}
      {...props}
    >
      {React.Children.map(children, (c) =>
        typeof c === "string" || typeof c === "number" ? (
          <GText size="sm" style={{ flex: 1 }}>
            {c}
          </GText>
        ) : React.isValidElement<{ color?: string; size?: number }>(c) && typeof c.type !== "string" && c.type !== CommandShortcut && c.type !== GText && c.props.color === undefined ? (
          React.cloneElement(c, { color: ui.mutedForeground, size: c.props.size ?? 16 })
        ) : (
          c
        )
      )}
    </Press>
  )
}

function CommandShortcut({ style, ...props }: GTextProps) {
  return <GText size="xs" tone="muted" style={[{ marginLeft: "auto", letterSpacing: 1.5 }, style]} {...props} />
}

export { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut }
