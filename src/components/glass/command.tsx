"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { cn } from "cn"
import { SearchIcon } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/glass/dialog"

/**
 * shadcn's Command (cmdk) for glass. On its own it's a transparent list — put it in a
 * card, a popover or `CommandDialog`, which floats it in a liquid panel (the control
 * layer). Inside: a search capsule, groups, fill rows and shortcuts — never more glass.
 */
function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return <CommandPrimitive data-slot="command" className={cn("flex size-full flex-col overflow-hidden text-popover-foreground", className)} {...props} />
}

/** ⌘K: a command palette in a liquid dialog. Open it with `open`/`onOpenChange`. */
function CommandDialog({
  title = "Command palette",
  description = "Search for a command to run…",
  children,
  className,
  showCloseButton = false,
  commandProps,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
  commandProps?: React.ComponentProps<typeof CommandPrimitive>
}) {
  return (
    <Dialog {...props}>
      <DialogContent data-slot="command-dialog" showCloseButton={showCloseButton} className={cn("gap-0 overflow-hidden p-0 sm:max-w-lg", className)}>
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>
        <Command {...commandProps}>{children}</Command>
      </DialogContent>
    </Dialog>
  )
}

/** The search capsule: a fill, a magnifier, the field. */
function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div data-slot="command-input-wrapper" className="p-2 pb-1">
      <div className="flex h-control items-center gap-2 rounded-button bg-fill px-3 has-[input:focus-visible]:outline-(length:--glass-ring-width) has-[input:focus-visible]:outline-ring has-[input:focus-visible]:outline-solid">
        <SearchIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
        <CommandPrimitive.Input
          data-slot="command-input"
          className={cn("h-full w-full min-w-0 bg-transparent text-base text-foreground placeholder:text-glass-label-tertiary focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className)}
          {...props}
        />
      </div>
    </div>
  )
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn("max-h-80 scroll-py-1.5 overflow-x-hidden overflow-y-auto overscroll-contain p-1.5 [scrollbar-width:thin]", className)}
      {...props}
    />
  )
}

function CommandEmpty({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty data-slot="command-empty" className={cn("py-6 text-center text-sm text-muted-foreground", className)} {...props} />
}

function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "overflow-hidden text-foreground **:[[cmdk-group-heading]]:px-2.5 **:[[cmdk-group-heading]]:pt-2 **:[[cmdk-group-heading]]:pb-1 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:tracking-wide **:[[cmdk-group-heading]]:text-muted-foreground **:[[cmdk-group-heading]]:uppercase",
        className
      )}
      {...props}
    />
  )
}

function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return <CommandPrimitive.Separator data-slot="command-separator" className={cn("-mx-1.5 my-1.5 h-px bg-separator", className)} {...props} />
}

/** A row: a fill follows the pointer and arrow keys (as the dropdown menu's rows). 44pt on touch. */
function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "relative flex cursor-default items-center gap-2.5 rounded-control-sm px-2.5 py-2 text-sm outline-hidden select-none pointer-coarse:py-3 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-fill-strong [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="command-shortcut" className={cn("ms-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />
}

export { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut }
