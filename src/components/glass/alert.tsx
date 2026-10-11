import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/**
 * shadcn's Alert: an inline callout on a fill (it sits on panes — not glass). An icon, a title
 * and a description; status variants tint the fill and colour the icon and title. `info`,
 * `success` and `destructive` are announced politely when they appear (`role="status"`), an
 * `AlertAction` sits at the end.
 */
const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-control px-pad-sm py-[calc(0.75rem*var(--glass-density))] text-sm has-[>svg]:grid-cols-[1rem_1fr] has-[>svg]:gap-x-3 has-data-[slot=alert-action]:pe-24 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-fill text-foreground [&>svg]:text-muted-foreground",
        info: "bg-primary/10 text-foreground *:data-[slot=alert-title]:text-primary-ink [&>svg]:text-primary-ink dark:bg-primary/16",
        success: "bg-success/12 text-foreground *:data-[slot=alert-title]:text-success-ink [&>svg]:text-success-ink",
        destructive: "bg-destructive/12 text-foreground *:data-[slot=alert-title]:text-destructive-ink [&>svg]:text-destructive-ink",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Alert({ className, variant = "default", ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" data-variant={variant} role={variant === "destructive" ? "alert" : "status"} className={cn(alertVariants({ variant }), className)} {...props} />
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-title" className={cn("col-start-2 line-clamp-1 min-h-4 font-semibold tracking-tight", className)} {...props} />
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-description" className={cn("col-start-2 grid justify-items-start gap-1 text-sm text-muted-foreground [&_p]:leading-relaxed", className)} {...props} />
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-action" className={cn("absolute top-1/2 end-2.5 -translate-y-1/2", className)} {...props} />
}

export { Alert, AlertTitle, AlertDescription, AlertAction, alertVariants }
