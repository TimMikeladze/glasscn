/** Geometry comes from rendered controls so text scaling participates in allocation. */
export type ToolbarLayoutCommand = {
  id: string
  width: number
  priority?: number
  pinned?: boolean
  overflow?: "auto" | "always"
}

export type ToolbarLayoutOptions = {
  gap: number
  padding: number
  groupGap: number
  overflowWidth: number
}

export type ToolbarCommandLayout = {
  visible: string[]
  pinned: string[]
  overflow: string[]
  scrollPinned: boolean
}

/** Pinned wins over overflow="always". Priority admits commands; source order renders them. */
export function allocateToolbarCommands(commands: readonly ToolbarLayoutCommand[], availableWidth: number, options: ToolbarLayoutOptions): ToolbarCommandLayout {
  const size = (n: number) => Number.isFinite(n) ? Math.max(0, n) : 0
  const { gap, padding, groupGap, overflowWidth } = options
  const pinned = commands.filter(c => c.pinned)
  const auto = commands.filter(c => !c.pinned && c.overflow !== "always")
  const always = commands.some(c => !c.pinned && c.overflow === "always")
  const groupWidth = (widths: number[]) => widths.length ? widths.reduce((sum, width) => sum + size(width), 0) + size(gap) * (widths.length - 1) + size(padding) : 0
  const pinnedWidth = groupWidth(pinned.map(c => c.width))
  const fits = (shown: readonly ToolbarLayoutCommand[], overflow: boolean) => {
    const mainWidth = groupWidth([...shown.map(c => c.width), ...(overflow ? [overflowWidth] : [])])
    return mainWidth + pinnedWidth + (mainWidth && pinnedWidth ? size(groupGap) : 0) <= size(availableWidth)
  }
  const admitted = new Set<string>()
  if (!always && fits(auto, false)) auto.forEach(c => admitted.add(c.id))
  else {
    // Stable sort breaks equal priorities by authored order, even on older consumers.
    const ranked = auto.map((command, index) => ({ command, index })).sort((a, b) => (b.command.priority ?? 0) - (a.command.priority ?? 0) || a.index - b.index)
    const shown: ToolbarLayoutCommand[] = []
    for (const { command } of ranked) {
      if (fits([...shown, command], true)) {
        admitted.add(command.id)
        shown.push(command)
      }
    }
  }
  const overflow = commands.filter(c => !c.pinned && !admitted.has(c.id)).map(c => c.id)
  return {
    visible: auto.filter(c => admitted.has(c.id)).map(c => c.id),
    pinned: pinned.map(c => c.id),
    overflow,
    scrollPinned: pinned.length > 0 && !fits([], overflow.length > 0),
  }
}
