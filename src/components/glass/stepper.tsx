"use client"

import * as React from "react"
import { cn } from "cn"
import { MinusIcon, PlusIcon } from "lucide-react"

/**
 * Apple's stepper: a − / + capsule pair on one fill, for small adjustments to a value shown
 * beside it. It's one `spinbutton` (arrow keys step, Shift or Page Up/Down step ×10, Home/End
 * jump to the ends); holding a button repeats, and Shift-click steps ×10. The buttons are for
 * the pointer and stay out of the tab order. Always show the value next to it — give the
 * stepper an `aria-label` naming what it changes.
 */
function Stepper({
  className,
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  formatValue,
  size = "default",
  ...props
}: Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  /** Spoken value, e.g. (v) => `${v} cups`. */
  formatValue?: (value: number) => string
  size?: "sm" | "default"
}) {
  const [inner, setInner] = React.useState(defaultValue)
  const value = valueProp ?? inner
  // the value a held button steps from (state is a render behind inside the timer)
  const latest = React.useRef(value)
  React.useEffect(() => {
    latest.current = value
  }, [value])
  const repeat = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const set = React.useCallback(
    (next: number) => {
      const clamped = Math.min(max, Math.max(min, Math.round(next / step) * step))
      if (clamped === latest.current) return false
      latest.current = clamped
      setInner(clamped)
      onValueChange?.(clamped)
      return true
    },
    [min, max, step, onValueChange]
  )
  const stop = React.useCallback(() => {
    if (repeat.current) clearTimeout(repeat.current)
    repeat.current = null
  }, [])
  React.useEffect(() => stop, [stop])

  const press = (e: React.PointerEvent, dir: 1 | -1) => {
    if (disabled || e.button !== 0) return
    const by = dir * step * (e.shiftKey ? 10 : 1)
    set(latest.current + by)
    // hold to repeat: a pause, then quickly
    const tick = (delay: number) => {
      repeat.current = setTimeout(() => {
        if (set(latest.current + by)) tick(70)
        else repeat.current = null
      }, delay)
    }
    tick(420)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    const big = step * 10
    const map: Record<string, number | undefined> = {
      ArrowUp: e.shiftKey ? big : step,
      ArrowRight: e.shiftKey ? big : step,
      ArrowDown: -(e.shiftKey ? big : step),
      ArrowLeft: -(e.shiftKey ? big : step),
      PageUp: big,
      PageDown: -big,
    }
    if (e.key === "Home") set(min)
    else if (e.key === "End") set(max)
    else if (map[e.key] !== undefined) set(value + (map[e.key] as number))
    else return
    e.preventDefault()
  }

  const button =
    "flex h-full flex-1 items-center justify-center text-foreground transition-[background-color,opacity] duration-(--glass-duration) ease-out hover:bg-fill-strong active:bg-fill-strong disabled:pointer-events-none disabled:opacity-35 [&_svg]:size-4"
  return (
    <div
      role="spinbutton"
      tabIndex={disabled ? -1 : 0}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={formatValue?.(value)}
      aria-disabled={disabled || undefined}
      data-slot="stepper"
      data-size={size}
      onKeyDown={onKeyDown}
      className={cn(
        "inline-flex w-[calc(5.75rem*var(--glass-density))] shrink-0 items-stretch overflow-hidden rounded-button bg-fill glass-focus select-none aria-disabled:opacity-50 data-[size=default]:h-control-sm data-[size=sm]:h-control-xs data-[size=sm]:w-[calc(4.75rem*var(--glass-density))]",
        className
      )}
      {...props}
    >
      <button type="button" tabIndex={-1} aria-label="Decrement" data-slot="stepper-decrement" disabled={disabled || value <= min} onPointerDown={(e) => press(e, -1)} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop} className={button}>
        <MinusIcon />
      </button>
      <span aria-hidden className="my-[25%] w-px bg-separator" />
      <button type="button" tabIndex={-1} aria-label="Increment" data-slot="stepper-increment" disabled={disabled || value >= max} onPointerDown={(e) => press(e, 1)} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop} className={button}>
        <PlusIcon />
      </button>
    </div>
  )
}

export { Stepper }
