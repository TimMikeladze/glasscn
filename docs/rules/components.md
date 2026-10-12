# Component rules

Follow shadcn's conventions exactly, then the glass ones.

## shadcn conventions
- One file per item in `src/components/glass/<name>.tsx`; named exports; `function` components, not `const` arrows or `forwardRef` (React 19 passes `ref` as a prop).
- Every rendered part has `data-slot="<part>"`; state goes on `data-*` (`data-variant`, `data-size`, `data-state`) so it can be styled from outside.
- Props: `React.ComponentProps<"div">` or `React.ComponentProps<typeof Primitive.Root>`, spread last; `className` merged **last** through `cn` (from the `cn` package).
- Variants with `cva`, exported beside the component (`buttonVariants`); defaults via `defaultVariants`.
- `asChild` via `Slot.Root` from `radix-ui` where the element may be a link.
- Radix through the unified `radix-ui` package. Icons from `lucide-react`.
- Keep shadcn's API when one exists (same parts, same prop names). Additive props only.
- `"use client"` only when the file uses state, effects, refs or Radix client primitives.

## Glass conventions
- Surfaces use `glass` / `glass-strong` / `glass-subtle` or `glassVariants`, never a hand-rolled `backdrop-blur` + `bg-white/50`.
- Colours only from tokens: `bg-fill`, `border-glass-border`, `text-muted-foreground`, `bg-primary`, `text-chart-2`… No hex, no `bg-zinc-*`.
- Corners, heights, paddings, motion and focus from tokens: `rounded-surface|control|button|badge`, `h-control*`, `px-pad*`, `duration-(--glass-duration) ease-glass`, `glass-press` (solid) / `glass-press-liquid` (liquid) for presses, `glass-focus` for focus. A component that sets its own `transition-*` lists `scale` in it, because the press utilities' default spring lives in the base layer and any transition utility replaces it.
- Overlays (menus, popovers, tooltips, dialogs) use `glass-materialize` for enter/exit instead of tw-animate fades; anchored ones add `glass-morph-origin` with `--glass-morph-w/-h/-origin` from Radix's trigger variables. Knobs and thumbs use `glass-knob-lens` (they need a `.group` parent that is pressed, or `data-dragging` on an ancestor).
- Type from the type utilities: titles `type-glass-heading` + a size, big figures `type-glass-display`, code and keys `font-glass-mono`, numbers `numeric-glass`, scale sizes `type-step-*`. Never `font-serif`, a font name, `tabular-nums` on themed figures, or `text-step-*` (tailwind-merge drops it as a colour).
- Customise a single surface with primitives on the element (`[--glass-blur:8px]`), or the two layer hooks `--glass-bg` / `--glass-elevation`, not with a new variant.
- Anything that animates on mount carries `data-glass-motion` so reduced motion stills it.
- Data components keep their maths in `src/lib/glass-charts.ts` (pure, tested); the component only renders.
- Every item has a demo in `src/components/demos/<name>.tsx` registered in `demos/index.ts`; its source is the docs' Usage.
