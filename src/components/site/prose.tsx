import { cn } from "cn"

/** Headings and paragraphs for the docs' own pages. */
export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="flex flex-col gap-2 pb-6">
      {eyebrow ? <div className="text-xs font-semibold tracking-wide text-primary uppercase">{eyebrow}</div> : null}
      <h1 className="font-heading text-4xl font-bold tracking-tight">{title}</h1>
      {description ? <p className="max-w-2xl text-lg text-muted-foreground">{description}</p> : null}
    </div>
  )
}

export function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mt-12 mb-4 scroll-mt-24 font-heading text-2xl font-bold tracking-tight">
      {children}
    </h2>
  )
}

export function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("mb-4 max-w-2xl leading-relaxed text-foreground/85", className)}>{children}</p>
}

export function C({ children }: { children: React.ReactNode }) {
  return <code className="rounded-md bg-fill px-1.5 py-0.5 font-mono text-[0.85em]">{children}</code>
}

export function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="relative flex gap-4 pb-8">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{n}</div>
      <div className="flex min-w-0 flex-1 flex-col gap-3 pt-1">
        <h3 className="font-heading text-lg font-semibold">{title}</h3>
        {children}
      </div>
    </div>
  )
}
