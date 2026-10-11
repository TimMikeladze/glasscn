"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { Label } from "@/components/glass/label"
import { Separator } from "@/components/glass/separator"

/**
 * shadcn's Field on glass: a label, a control, a description and an error laid out together.
 * Beyond shadcn, a Field wires its control for you — the first input, textarea, select trigger,
 * switch, checkbox or slider inside gets an id (if it has none), the FieldLabel's `htmlFor`,
 * `aria-describedby` pointing at the description and error, and `aria-invalid` when the field
 * is `data-invalid` or shows an error. `orientation="horizontal"` is a settings row: label
 * leading, switch trailing.
 */

const CONTROL = "input:not([type=hidden]), textarea, select, button[role=combobox], button[role=switch], button[role=checkbox], [role=slider], [role=radiogroup], [role=spinbutton]"

type FieldIds = { control: string; description: string; error: string }
const FieldContext = React.createContext<FieldIds | null>(null)

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return <fieldset data-slot="field-set" className={cn("flex flex-col gap-6 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3", className)} {...props} />
}

function FieldLegend({ className, variant = "legend", ...props }: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn("mb-3 type-glass-heading text-foreground data-[variant=label]:text-sm data-[variant=legend]:text-base", className)}
      {...props}
    />
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field-group" className={cn("group/field-group @container/field-group flex w-full flex-col gap-[calc(1.5rem*var(--glass-density))] data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4", className)} {...props} />
}

const fieldVariants = cva("group/field flex w-full gap-[calc(0.5rem*var(--glass-density))] data-[invalid=true]:text-destructive-ink", {
  variants: {
    orientation: {
      vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
      horizontal: "flex-row items-center justify-between *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:items-start",
      responsive:
        "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto",
    },
  },
  defaultVariants: { orientation: "vertical" },
})

function Field({ className, orientation = "vertical", children, ...props }: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  const base = React.useId()
  const ids = React.useMemo(() => ({ control: `${base}-control`, description: `${base}-description`, error: `${base}-error` }), [base])
  const ref = React.useRef<HTMLDivElement>(null)
  const invalid = props["data-invalid" as keyof typeof props] as boolean | string | undefined

  // Wire the control after every render: the description / error may come and go.
  React.useLayoutEffect(() => {
    const root = ref.current
    const control = root?.querySelector<HTMLElement>(CONTROL)
    if (!root || !control) return
    if (!control.id) control.id = ids.control
    const label = root.querySelector<HTMLLabelElement>("label[data-slot=field-label]")
    if (label && !label.htmlFor) label.htmlFor = control.id
    if (control.id !== ids.control && label?.htmlFor === ids.control) label.htmlFor = control.id
    const described = [ids.description, ids.error].filter((id) => root.querySelector(`[id="${id}"]`))
    const own = (control.getAttribute("aria-describedby") ?? "").split(" ").filter((id) => id && id !== ids.description && id !== ids.error)
    const all = [...own, ...described].join(" ")
    if (all) control.setAttribute("aria-describedby", all)
    else control.removeAttribute("aria-describedby")
    const hasError = !!root.querySelector(`[id="${ids.error}"]`)
    if (invalid === true || invalid === "true" || hasError) control.setAttribute("aria-invalid", "true")
    else if (control.dataset.fieldInvalid) control.removeAttribute("aria-invalid")
    control.dataset.fieldInvalid = invalid === true || invalid === "true" || hasError ? "true" : ""
  })

  return (
    <FieldContext.Provider value={ids}>
      <div ref={ref} role="group" data-slot="field" data-orientation={orientation} className={cn(fieldVariants({ orientation }), className)} {...props}>
        {children}
      </div>
    </FieldContext.Provider>
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field-content" className={cn("group/field-content flex flex-1 flex-col gap-1 leading-snug", className)} {...props} />
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-control has-[>[data-slot=field]]:bg-fill has-data-[state=checked]:has-[>[data-slot=field]]:inset-ring-2 has-data-[state=checked]:has-[>[data-slot=field]]:inset-ring-primary *:data-[slot=field]:p-[calc(0.875rem*var(--glass-density))]",
        className
      )}
      {...props}
    />
  )
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field-label" className={cn("flex w-fit items-center gap-2 text-sm leading-snug font-medium group-data-[disabled=true]/field:opacity-50", className)} {...props} />
}

function FieldDescription({ className, id, ...props }: React.ComponentProps<"p">) {
  const ids = React.useContext(FieldContext)
  return (
    <p
      id={id ?? ids?.description}
      data-slot="field-description"
      className={cn(
        "text-sm leading-normal font-normal text-pretty text-muted-foreground group-has-data-[orientation=horizontal]/field:text-balance nth-last-2:-mt-1 last:mt-0 [[data-variant=legend]+&]:-mt-1.5 [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary-ink",
        className
      )}
      {...props}
    />
  )
}

function FieldSeparator({ children, className, ...props }: React.ComponentProps<"div"> & { children?: React.ReactNode }) {
  return (
    <div data-slot="field-separator" data-content={!!children} className={cn("relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2", className)} {...props}>
      <Separator className="absolute inset-0 top-1/2" />
      {children ? (
        <span className="relative mx-auto block w-fit bg-(--glass-tint) px-2 text-muted-foreground" data-slot="field-separator-content">
          {children}
        </span>
      ) : null}
    </div>
  )
}

/** The error under a field. Pass `errors` (e.g. from react-hook-form / zod) or children; renders nothing when empty. Announced politely. */
function FieldError({ className, children, errors, id, ...props }: React.ComponentProps<"div"> & { errors?: Array<{ message?: string } | undefined> }) {
  const ids = React.useContext(FieldContext)
  const content = React.useMemo(() => {
    if (children) return children
    const messages = [...new Set((errors ?? []).map((e) => e?.message).filter(Boolean))] as string[]
    if (messages.length === 0) return null
    if (messages.length === 1) return messages[0]
    return (
      <ul className="ms-4 flex list-disc flex-col gap-1">
        {messages.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
    )
  }, [children, errors])
  if (!content) return null
  return (
    <div id={id ?? ids?.error} role="alert" data-slot="field-error" className={cn("text-sm font-normal text-destructive-ink", className)} {...props}>
      {content}
    </div>
  )
}

export { Field, FieldLabel, FieldDescription, FieldError, FieldGroup, FieldLegend, FieldSeparator, FieldSet, FieldContent, FieldTitle }
