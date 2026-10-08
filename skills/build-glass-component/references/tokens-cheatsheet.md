# Which token for what

| Need | Use | Not |
|---|---|---|
| A pane | `glass` / `glass-strong` / `glass-subtle`, or `glassVariants({ intensity, tint, elevation })` | `backdrop-blur-xl bg-white/50 border` |
| A control fill on glass | `bg-fill`, hover `bg-fill-strong` | `bg-muted`, `bg-black/5` |
| An edge on glass | `border-glass-border` | `border-border` |
| Accent | `bg-primary text-primary-foreground`, washes `bg-primary/16 text-primary` | any palette colour class |
| Data colours | `var(--chart-1..5)` / `bg-chart-2` | hard-coded colours |
| Surface corners | `rounded-surface`, smaller `rounded-surface-sm` | `rounded-3xl` |
| Control corners | `rounded-control`, inner `rounded-control-sm` | `rounded-xl` |
| Button / pill corners | `rounded-button` | `rounded-full` (only for truly circular things: dots, knobs) |
| Badge corners | `rounded-badge` | `rounded-full` |
| Control height | `h-control-xs|sm|(default)|lg`, `size-control*` | `h-10` |
| Horizontal padding | `px-pad-xs|sm|(default)|lg` | `px-5` |
| Card padding | `[--card-spacing:calc(1.25rem*var(--glass-density))]` | `p-6` |
| Other density-aware sizes | `h-[calc(2.25rem*var(--glass-density))]` | fixed |
| Transitions | `duration-(--glass-duration) ease-glass` | `duration-200 ease-out` |
| Press | `active:scale-(--glass-press-scale)` | `active:scale-95` |
| Focus | `focus-visible:ring-(length:--glass-ring-width) focus-visible:ring-ring/50` | `ring-2` |
| Titles | `type-glass-heading text-lg` | `font-semibold tracking-tight` |
| Big figures | `type-glass-display text-3xl` | `font-bold tabular-nums` |
| Code, keys | `font-glass-mono` | `font-mono` |
| Numbers in text | `numeric-glass` | `tabular-nums` |
| Sizes on the scale | `type-step-n2 … type-step-6` | `text-step-*` (tailwind-merge drops it) |
| Body type on a subtree | `type-glass` | `font-sans leading-relaxed` |
| Raised thumb | `bg-glass-thumb` | `bg-white` |
| One-off restyle | primitives on the element: `[--glass-blur:8px]`, `[--glass-opacity:70%]`; layers: `[--glass-bg:…]`, `[--glass-elevation:0_0_#0000]` | a new variant |
| Mount animation | add `data-glass-motion` (reduced motion stills it) | unconditional animation |
